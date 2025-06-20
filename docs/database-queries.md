# データベースクエリ設計書

このドキュメントでは、Type-Trackアプリケーションで必要なクエリパターンを整理します。

## データモデル概要

現在のPrismaスキーマに基づく主要なテーブル：

- `Topic`: お題
- `Word`: ワード（お題に属する）
- `WordPractice`: 基本練習の開始記録
- `WordPracticeCompletion`: 基本練習の完了・中断記録
- `PracticalPractice`: 実践練習の開始記録
- `PracticalPracticeCompletion`: 実践練習の完了・中断記録
- `PracticalWordPractice`: 実践練習と個別ワード練習の関連

## 画面別のユースケースとクエリ

### 1. お題詳細画面（基本練習モード）

#### 1.1 ワード一覧とメトリクス取得

特定お題のワード一覧を統計情報と共に取得：

```sql
-- ワード一覧、KPM中央値、挑戦回数を取得
WITH word_stats AS (
  SELECT
    wp.wordId,
    COUNT(wpc.id) as practice_count,
    AVG(wpc.kpm) as avg_kpm,
    -- 中央値の計算（SQLiteの場合）
    (SELECT kpm FROM WordPracticeCompletion wpc2
     WHERE wpc2.wordPracticeId IN
       (SELECT id FROM WordPractice WHERE wordId = wp.wordId)
       AND wpc2.status = 'COMPLETED'
       AND wpc2.kpm IS NOT NULL
     ORDER BY kmp LIMIT 1
     OFFSET (SELECT COUNT(*) FROM WordPracticeCompletion wpc3
             WHERE wpc3.wordPracticeId IN
               (SELECT id FROM WordPractice WHERE wordId = wp.wordId)
               AND wpc3.status = 'COMPLETED'
               AND wpc3.kpm IS NOT NULL) / 2
    ) as median_kpm
  FROM WordPractice wp
  LEFT JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId
  WHERE wpc.status = 'COMPLETED' OR wpc.status IS NULL
  GROUP BY wp.wordId
)
SELECT
  w.id,
  w.text,
  w.reading,
  COALESCE(ws.practice_count, 0) as practice_count,
  ws.avg_kpm,
  ws.median_kpm
FROM Word w
LEFT JOIN word_stats ws ON w.id = ws.wordId
WHERE w.topicId = ?
ORDER BY w.id;
```

#### 1.2 ワード検索（漢字・ひらがな・ローマ字）

```sql
-- テキスト・読みによる検索
SELECT w.id, w.text, w.reading, t.name as topic_name
FROM Word w
JOIN Topic t ON w.topicId = t.id
WHERE w.text LIKE '%' || ? || '%'
   OR w.reading LIKE '%' || ? || '%'
ORDER BY w.text;
```

#### 1.3 基本練習の記録登録

```sql
-- 練習開始時
INSERT INTO WordPractice (wordId, startedAt, keystrokeTimes)
VALUES (?, ?, ?);

-- 練習完了・中断時
INSERT INTO WordPracticeCompletion (
  wordPracticeId, status, inputText, characterCount, missCount,
  durationMs, firstStrokeMs, kpm, rkpm
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
```

### 2. 実践練習モード

#### 2.1 実践練習の記録登録

```sql
-- 実践練習開始時
INSERT INTO PracticalPractice (startedAt) VALUES (?);

-- 各ワード練習の関連付け
INSERT INTO PracticalWordPractice (practicalPracticeId, wordPracticeId, wordOrder)
VALUES (?, ?, ?);

-- 実践練習完了・中断時
INSERT INTO PracticalPracticeCompletion (
  practicalPracticeId, status, characterCount, missCount,
  durationMs, firstStrokeMs, kpm, rkpm
) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

### 3. ワード詳細画面

#### 3.1 特定ワードの練習履歴

```sql
-- ワードの詳細な練習記録を取得
SELECT
  wp.startedAt,
  wpc.inputText,
  wpc.characterCount,
  wpc.missCount,
  wpc.durationMs,
  wpc.kpm,
  wpc.rkpm,
  wpc.status,
  wp.keystrokeTimes -- JSON形式のキーストロークデータ
FROM WordPractice wp
LEFT JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId
WHERE wp.wordId = ?
ORDER BY wp.startedAt DESC
LIMIT 20;
```

### 4. 実践練習結果詳細画面

#### 4.1 実践練習の総合結果

```sql
-- 実践練習全体の結果
SELECT
  pp.startedAt,
  ppc.status,
  ppc.characterCount,
  ppc.missCount,
  ppc.durationMs,
  ppc.firstStrokeMs,
  ppc.kpm,
  ppc.rkpm,
  (CAST(ppc.characterCount - ppc.missCount AS REAL) / ppc.characterCount * 100) as accuracy
FROM PracticalPractice pp
LEFT JOIN PracticalPracticeCompletion ppc ON pp.id = ppc.practicalPracticeId
WHERE pp.id = ?;
```

#### 4.2 実践練習の各ワード結果

```sql
-- 実践練習内の各ワード成績
SELECT
  pwp.wordOrder,
  w.text,
  w.reading,
  wpc.characterCount,
  wpc.missCount,
  wpc.durationMs,
  wpc.firstStrokeMs,
  wpc.kpm,
  wpc.rkpm,
  (CAST(wpc.characterCount - wpc.missCount AS REAL) / wpc.characterCount * 100) as accuracy
FROM PracticalWordPractice pwp
JOIN WordPractice wp ON pwp.wordPracticeId = wp.id
JOIN Word w ON wp.wordId = w.id
LEFT JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId
WHERE pwp.practicalPracticeId = ?
ORDER BY pwp.wordOrder;
```

### 5. 分析・統計機能

#### 5.1 日別練習統計

```sql
-- 日別の練習量とパフォーマンス
SELECT
  DATE(wpc.completedAt) as practice_date,
  COUNT(DISTINCT wp.wordId) as unique_words,
  COUNT(*) as total_attempts,
  AVG(wpc.kpm) as avg_kpm,
  AVG(wpc.rkpm) as avg_rkpm,
  AVG(CAST(wpc.characterCount - wpc.missCount AS REAL) / wpc.characterCount * 100) as avg_accuracy
FROM WordPracticeCompletion wpc
JOIN WordPractice wp ON wpc.wordPracticeId = wp.id
WHERE wpc.status = 'COMPLETED'
  AND wpc.completedAt >= datetime('now', '-30 days')
GROUP BY DATE(wpc.completedAt)
ORDER BY practice_date DESC;
```

#### 5.2 苦手ワード分析

```sql
-- エラー率が高いワードの特定
SELECT
  w.id,
  w.text,
  w.reading,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN wpc.inputText != w.text THEN 1 END) as error_count,
  CAST(COUNT(CASE WHEN wpc.inputText != w.text THEN 1 END) AS REAL) / COUNT(*) as error_rate,
  AVG(wpc.kpm) as avg_kpm
FROM Word w
JOIN WordPractice wp ON w.id = wp.wordId
JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId
WHERE wpc.status = 'COMPLETED'
  AND wpc.completedAt >= datetime('now', '-30 days')
GROUP BY w.id, w.text, w.reading
HAVING COUNT(*) >= 3
ORDER BY error_rate DESC, error_count DESC
LIMIT 20;
```

### 6. データメンテナンス

#### 6.1 初期データ投入

```sql
-- サンプルデータの挿入
INSERT INTO Topic (name) VALUES
  ('元気が出る言葉'),
  ('基本練習');

INSERT INTO Word (topicId, text, reading) VALUES
  (1, '案外できるものだよ', 'あんがいできるものだよ'),
  (1, '大丈夫、きっとうまくいく', 'だいじょうぶ、きっとうまくいく'),
  (2, 'hello world', 'hello world'),
  (2, 'programming', 'programming');
```

## パフォーマンス考慮事項

### 推奨インデックス

```sql
-- ワード関連
CREATE INDEX idx_word_topicid ON Word(topicId);

-- 練習記録関連
CREATE INDEX idx_wordpractice_wordid ON WordPractice(wordId);
CREATE INDEX idx_wordpractice_startedat ON WordPractice(startedAt);

-- 完了記録関連
CREATE INDEX idx_wordpracticecompletion_completedat ON WordPracticeCompletion(completedAt);
CREATE INDEX idx_wordpracticecompletion_status ON WordPracticeCompletion(status);

-- 実践練習関連
CREATE INDEX idx_practicalwordpractice_practicalid ON PracticalWordPractice(practicalPracticeId);
CREATE INDEX idx_practicalwordpractice_wordorder ON PracticalWordPractice(practicalPracticeId, wordOrder);
```

## 実装時の注意点

1. **JSON操作**: `keystrokeTimes`のJSON解析は重い処理なので、分析用途以外では避ける
2. **中央値計算**: SQLiteでの中央値計算は複雑なので、アプリケーション側での処理も検討
3. **バッチ挿入**: 大量データの初期投入時はトランザクションを使用
4. **データ型**: 時間計算では整数型（ミリ秒）を使用してパフォーマンスを確保

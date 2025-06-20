# SQLite WASM データベース実装チェックリスト

## 1. 環境セットアップ

- [x] SQLite WASM関連のパッケージを調査・選定
- [x] 必要なパッケージのインストール
- [x] Vite設定の更新（WASM対応）

## 2. データベース設計

- [ ] 既存のsampleData.tsを参考にテーブル設計
- [ ] Topics（お題）テーブル設計
- [ ] Words（ワード）テーブル設計
- [ ] WordPracticeRecords（個別練習記録）テーブル設計
- [ ] PracticalPracticeRecords（実践練習記録）テーブル設計
- [ ] データベーススキーマSQLファイル作成

## リファクタリング

複数の感心事が一つのファイルに入っている状態なので、改善したいです。具体的には`database-api.ts`と`database-worker.ts`です。

`database-api.ts`について

- データベースクライアントの初期化処理、マイグレーション、データベースを使うロジックが混ざっている
- このファイルがworkerとして読み込むファイルなので、こちらを`database-worker.ts`とするのが適切だった

`database-worker.ts`について

- このファイルは単に`database.ts`でもいいかも。データベースにアクセスするエントリーポイントとなるので、ここに初期化処理を書くのが適切か。
- デバッグ用の関数は別のファイルで定義するようにしたい。

まず、データベースを使うロジックを分離していきましょう。概念の命名はtRPCを参考にしました。

```ts
// database-model.ts データベースから取得したデータの型を定義
export interface Topic {
  id: number
  name: string
  createdAt: string
}

// topic-procedure.ts お題関連のバックエンド処理を書く
import { database } from './database'

// databaseは引数で受け取るようにして、ワーカーから処理を分離する
async function getTopics({ database }: ProcedureParams): Promise<Topic[]> {
  const rows = database.exec('SELECT * FROM Topic ORDER BY createdAt DESC', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })
  return rows as unknown as Topic[]
}

// routerはprocedureの集まり
export const topicRouter = {
  getTopics: () => getTopics({ database }),
  createTopic: (input: { name: string }) => createTopic({ database, input })
}

// database.ts ワーカーを初期化する
import type { DatabaseWorker } from './database-worker'

function createWorker<T>(path: string): Remote<T> {
  return Comlink.wrap<T>(
    new Worker(new URL(path, import.meta.url), {
      type: 'module',
    })
  )
}

export const database = createWorker<DatabaseWorker>('./database-worker.ts')
```

再度リファクタリングを行います。以下の部分のセマンティクスが不自然なので修正したいです。

```ts
// useTopicsDataDB.ts
// database.<procedure>は不自然 router.<procedure>にしたい
const loadedTopics = await database.getTopics()
```

まず、`database-worker-new.ts`でルーターの定義を行うのをやめて、ルーターがデータベースワーカーに依存しないようにしましょう。

次に、ルーターの処理はワーカーの外で実行するようにします。実装が思いついていないのでいい感じにやっていただけると助かります。

```ts
// topic-router.ts
import { database } from './database.ts'

async function getTopics({ database }: ProcedureParams): Promise<Topic[]> {
  const rows = database.exec('SELECT * FROM Topic ORDER BY createdAt DESC', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })
  return rows as unknown as Topic[]
}

type ProcedureParams<T> = {
  database: unknown, // 省略
} & T;

// withDatabaseは (params: ProcedureParams<Input>) => Promise<T> を(input: Input) => Promise<T>に変換する関数
// ↑適切な名前があれば変更する
function withDatabase<T>(fn: (params: ProcedureParams<Input>) => Promise<T>): () => Promise<T> {
  // 実装よくわからないので適当
  return (input: Input) => fn({ database, input })
}

const topicRouter = {
  getTopics: withDatabase(getTopics)
}

// useTopicsDataDB.ts
const loadedTopis = await topicRouter.getTopics()
```

## 3. データベースアクセス層

- [ ] SQLiteの初期化とマイグレーション機能
- [ ] Topics CRUD操作の実装
- [ ] Words CRUD操作の実装
- [ ] Practice Records関連のCRUD操作
- [ ] 既存のsampleDataからの初期データ投入機能

## 4. 既存コードの統合

- [ ] useTopicsData hooksの書き換え（SQLite版）
- [ ] dataLoader.tsの更新
- [ ] 既存のコンポーネントでのデータ取得部分の更新

## 5. テストとデバッグ

- [ ] 基本的なCRUD操作の動作確認
- [ ] 既存機能が正常に動作することの確認
- [ ] パフォーマンステスト

## 6. 最適化とエラーハンドリング

- [ ] エラーハンドリングの実装
- [ ] データベースの最適化
- [ ] 型安全性の確保

## 備考

- playground/sqlite-todo/の既存実装を参考にする
- 段階的に実装し、各段階で動作確認を行う
- 既存のUI/UXを変更せずにバックエンドのみ変更する

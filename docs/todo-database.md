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
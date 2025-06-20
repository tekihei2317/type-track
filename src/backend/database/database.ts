import * as Comlink from 'comlink'
import type { Remote } from 'comlink'

// Workerとの通信用インターフェース
export interface DatabaseWorkerProxy {
  executeQuery: (sql: string, params?: unknown[]) => Promise<unknown[]>
  seedInitialData: () => Promise<void>
}

// Workerのインターフェース（データベース操作とマイグレーション管理）
interface DatabaseWorkerApi {
  executeQuery: (sql: string, params?: unknown[]) => Promise<unknown[]>
  seedInitialData: () => Promise<void>
  runMigrations: () => Promise<void>
  resetDatabase: () => Promise<void>
}

function createWorker<T>(path: string): Remote<T> {
  return Comlink.wrap<T>(
    new Worker(new URL(path, import.meta.url), {
      type: 'module',
    })
  )
}

// Workerプロキシ - 低レベルなデータベース操作のみ
const databaseWorker = createWorker<DatabaseWorkerApi>('../worker/database-worker.ts')

// DatabaseWorkerProxyの実装
export const database: DatabaseWorkerProxy = {
  executeQuery: (sql: string, params?: unknown[]) => databaseWorker.executeQuery(sql, params),
  seedInitialData: () => databaseWorker.seedInitialData(),
}

// マイグレーション管理用の追加API
export const migrationApi = {
  migrate: () => databaseWorker.runMigrations(),
  reset: () => databaseWorker.resetDatabase(),
  seed: () => databaseWorker.seedInitialData(),
}

// アプリ起動時にマイグレーションと初期データを投入
// 注意: initDBでrunMigrations()が呼ばれるため、明示的にmigrateを呼ぶ必要はない
database.seedInitialData().catch(console.error)

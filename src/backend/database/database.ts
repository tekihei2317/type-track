import * as Comlink from 'comlink'
import type { Remote } from 'comlink'

// Workerとの通信用インターフェース
export interface DatabaseWorkerProxy {
  executeQuery: (sql: string, params?: unknown[]) => Promise<unknown[]>
  seedInitialData: () => Promise<void>
}

// Workerの最小限のインターフェース（CRUD操作は除く）
interface DatabaseWorkerApi {
  executeQuery: (sql: string, params?: unknown[]) => Promise<unknown[]>
  seedInitialData: () => Promise<void>
}

function createWorker<T>(path: string): Remote<T> {
  return Comlink.wrap<T>(
    new Worker(new URL(path, import.meta.url), {
      type: 'module',
    })
  )
}

// Workerプロキシ - 低レベルなデータベース操作のみ
const databaseWorker = createWorker<DatabaseWorkerApi>('./database-worker-new.ts')

// DatabaseWorkerProxyの実装
export const database: DatabaseWorkerProxy = {
  executeQuery: (sql: string, params?: unknown[]) => databaseWorker.executeQuery(sql, params),
  seedInitialData: () => databaseWorker.seedInitialData(),
}

// アプリ起動時に初期データを投入
database.seedInitialData().catch(console.error)

import * as Comlink from 'comlink'
import type { Remote } from 'comlink'
import type { TodoApi } from './todo-api'

function createWorker<T>(path: string): Remote<T> {
  return Comlink.wrap<T>(
    new Worker(new URL(path, import.meta.url), {
      type: 'module',
    })
  )
}

export const todoApi = createWorker<TodoApi>('./todo-api.ts')

// デバッグ用: ブラウザコンソールからSQL実行できるようにする
declare global {
  interface Window {
    debugSQL: (sql: string) => Promise<unknown>
    showTables: () => Promise<unknown>
    showSchema: (tableName?: string) => Promise<unknown>
  }
}

// デバッグ関数をwindowに追加
if (typeof window !== 'undefined') {
  window.debugSQL = async (sql: string) => {
    try {
      const result = await todoApi.executeQuery(sql)
      console.table(result)
      return result
    } catch (error) {
      console.error('SQL Error:', error)
      throw error
    }
  }

  window.showTables = async () => {
    return window.debugSQL("SELECT name FROM sqlite_master WHERE type='table'")
  }

  window.showSchema = async (tableName?: string) => {
    if (tableName) {
      return window.debugSQL(`PRAGMA table_info(${tableName})`)
    } else {
      console.log('Usage: showSchema("table_name")')
      return window.showTables()
    }
  }
}

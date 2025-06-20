import * as Comlink from 'comlink'
import type { Remote } from 'comlink'
import type { DatabaseApi } from './database-api'

function createWorker<T>(path: string): Remote<T> {
  return Comlink.wrap<T>(
    new Worker(new URL(path, import.meta.url), {
      type: 'module',
    })
  )
}

export const databaseApi = createWorker<DatabaseApi>('./database-api.ts')

// デバッグ用: ブラウザコンソールからSQL実行できるようにする
declare global {
  interface Window {
    debugSQL: (sql: string, params?: any[]) => Promise<unknown>
    showTables: () => Promise<unknown>
    showTopics: () => Promise<unknown>
    showWords: (topicId?: number) => Promise<unknown>
  }
}

// デバッグ関数をwindowに追加
if (typeof window !== 'undefined') {
  window.debugSQL = async (sql: string, params: any[] = []) => {
    try {
      const result = await databaseApi.executeQuery(sql, params)
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

  window.showTopics = async () => {
    const topics = await databaseApi.getTopics()
    console.table(topics)
    return topics
  }

  window.showWords = async (topicId?: number) => {
    if (topicId) {
      const words = await databaseApi.getWordsByTopic(topicId)
      console.table(words)
      return words
    } else {
      return window.debugSQL('SELECT * FROM Word')
    }
  }
}

// アプリ起動時に初期データを投入
databaseApi.seedInitialData().catch(console.error)

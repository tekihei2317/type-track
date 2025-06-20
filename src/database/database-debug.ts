import { database } from './database'
import { topicRouter } from './topic-router'
import { wordRouter } from './word-router'

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
      const result = await database.executeQuery(sql, params)
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
    const topics = await topicRouter.getTopics()
    console.table(topics)
    return topics
  }

  window.showWords = async (topicId?: number) => {
    if (topicId) {
      const words = await wordRouter.getWordsByTopic({ topicId })
      console.table(words)
      return words
    } else {
      return window.debugSQL('SELECT * FROM Word')
    }
  }
}
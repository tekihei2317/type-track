import { database, migrationApi } from './database'

// デバッグ用: ブラウザコンソールからSQL実行できるようにする
declare global {
  interface Window {
    debugSQL: (sql: string, params?: unknown[]) => Promise<unknown>
    showTables: () => Promise<unknown>
    showTopics: () => Promise<unknown>
    showWords: (topicId?: number) => Promise<unknown>
    db: {
      migrate: () => Promise<void>
      reset: () => Promise<void>
      seed: () => Promise<void>
    }
  }
}

// デバッグ関数をwindowに追加
if (typeof window !== 'undefined') {
  window.debugSQL = async (sql: string, params: unknown[] = []) => {
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

  // マイグレーション管理用のコンソール関数
  window.db = {
    migrate: async () => {
      console.log('Running migrations...')
      await migrationApi.migrate()
      console.log('Migrations completed')
    },
    reset: async () => {
      console.log('Resetting database...')
      await migrationApi.reset()
      console.log('Database reset completed')
    },
    seed: async () => {
      console.log('Running seed data...')
      await migrationApi.seed()
      console.log('Seed completed')
    },
  }
}

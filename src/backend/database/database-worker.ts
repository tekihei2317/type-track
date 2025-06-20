// SQLite WASM + Comlink based Database Worker
import * as Comlink from 'comlink'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import type { Database } from '@sqlite.org/sqlite-wasm'

// マイグレーションファイルのインポート
import migrationSQL from '../../../prisma/migrations/20250620072129_init/migration.sql?raw'

let db: Database | null = null

async function initDB(): Promise<Database> {
  if (db) return db

  console.log('Initializing SQLite in worker...')
  const sqlite3 = await sqlite3InitModule({
    print: console.log,
    printErr: console.error,
  })

  console.log('SQLite version:', sqlite3.version.libVersion)
  console.log('OPFS available:', !!('opfs' in sqlite3))

  if ('opfs' in sqlite3) {
    console.log('Using OPFS for persistence')
    db = new sqlite3.oo1.OpfsDb('/type-track.db')
  } else {
    console.log('OPFS not available, using memory database')
    db = new sqlite3.oo1.DB()
  }

  // マイグレーションの実行
  console.log('Running migrations...')
  db.exec(migrationSQL)
  console.log('Migrations completed')

  return db
}

// 初期データの投入
async function seedInitialData(): Promise<void> {
  const database = await initDB()

  // 既にデータがある場合はスキップ
  const existingTopics = database.exec('SELECT COUNT(*) as count FROM Topic', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })

  if ((existingTopics[0] as unknown as { count: number }).count > 0) {
    console.log('Initial data already exists, skipping seed')
    return
  }

  console.log('Seeding initial data...')

  // サンプルお題の作成
  database.exec(`
    INSERT INTO Topic (name) VALUES
      ('元気が出る言葉'),
      ('基本練習')
  `)

  // サンプルワードの作成
  database.exec(`
    INSERT INTO Word (topicId, text, reading) VALUES
      (1, '案外できるものだよ', 'あんがいできるものだよ'),
      (1, '大丈夫、きっとうまくいく', 'だいじょうぶ、きっとうまくいく'),
      (2, 'hello world', 'hello world'),
      (2, 'programming', 'programming')
  `)

  console.log('Initial data seeded successfully')
}

// 汎用クエリ実行（デバッグ用）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeQuery(sql: string, params: any[] = []): Promise<unknown[]> {
  const database = await initDB()

  return database.exec(sql, {
    bind: params,
    returnValue: 'resultRows',
    rowMode: 'object',
  })
}

// 最小限のWorker API - 低レベルなデータベース操作のみ
const databaseWorkerApi = {
  // 汎用クエリ実行
  executeQuery,

  // 初期データ投入
  seedInitialData,
}

export type DatabaseWorkerApi = typeof databaseWorkerApi

Comlink.expose(databaseWorkerApi)

// SQLite WASM + Comlink based Database API
import * as Comlink from 'comlink'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import type { Database } from '@sqlite.org/sqlite-wasm'

// マイグレーションファイルのインポート
import migrationSQL from '../../prisma/migrations/20250620072129_init/migration.sql?raw'

export interface Topic {
  id: number
  name: string
  createdAt: string
}

export interface Word {
  id: number
  topicId: number
  text: string
  reading: string
  createdAt: string
}

export interface WordPractice {
  id: number
  wordId: number
  startedAt: string
  keystrokeTimes: string
}

export interface WordPracticeCompletion {
  id: number
  wordPracticeId: number
  status: 'COMPLETED' | 'ABORTED'
  inputText: string
  characterCount: number
  missCount: number
  durationMs: number
  firstStrokeMs?: number
  kpm?: number
  rkpm?: number
  completedAt: string
}

export interface PracticalPractice {
  id: number
  startedAt: string
}

export interface PracticalPracticeCompletion {
  id: number
  practicalPracticeId: number
  status: 'COMPLETED' | 'ABORTED'
  characterCount: number
  missCount: number
  durationMs: number
  firstStrokeMs?: number
  kpm?: number
  rkpm?: number
  completedAt: string
}

export interface PracticalWordPractice {
  id: number
  practicalPracticeId: number
  wordPracticeId: number
  wordOrder: number
}

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

// Topics
async function getTopics(): Promise<Topic[]> {
  const database = await initDB()
  const rows = database.exec('SELECT * FROM Topic ORDER BY createdAt DESC', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })
  return rows as unknown as Topic[]
}

async function getTopic(id: number): Promise<Topic | null> {
  const database = await initDB()
  const rows = database.exec('SELECT * FROM Topic WHERE id = ?', {
    bind: [id],
    returnValue: 'resultRows',
    rowMode: 'object',
  })
  return (rows as unknown as Topic[])[0] || null
}

async function createTopic(name: string): Promise<Topic> {
  const database = await initDB()

  database.exec('INSERT INTO Topic (name) VALUES (?)', {
    bind: [name],
  })

  const row = database.exec('SELECT * FROM Topic WHERE id = last_insert_rowid()', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })[0]

  return row as unknown as Topic
}

// Words
async function getWordsByTopic(topicId: number): Promise<Word[]> {
  const database = await initDB()
  const rows = database.exec('SELECT * FROM Word WHERE topicId = ? ORDER BY id', {
    bind: [topicId],
    returnValue: 'resultRows',
    rowMode: 'object',
  })
  return rows as unknown as Word[]
}

async function getWord(id: number): Promise<Word | null> {
  const database = await initDB()
  const rows = database.exec('SELECT * FROM Word WHERE id = ?', {
    bind: [id],
    returnValue: 'resultRows',
    rowMode: 'object',
  })
  return (rows as unknown as Word[])[0] || null
}

async function createWord(topicId: number, text: string, reading: string): Promise<Word> {
  const database = await initDB()

  database.exec('INSERT INTO Word (topicId, text, reading) VALUES (?, ?, ?)', {
    bind: [topicId, text, reading],
  })

  const row = database.exec('SELECT * FROM Word WHERE id = last_insert_rowid()', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })[0]

  return row as unknown as Word
}

// Word Practice
async function createWordPractice(wordId: number, keystrokeTimes: string): Promise<WordPractice> {
  const database = await initDB()

  database.exec('INSERT INTO WordPractice (wordId, keystrokeTimes) VALUES (?, ?)', {
    bind: [wordId, keystrokeTimes],
  })

  const row = database.exec('SELECT * FROM WordPractice WHERE id = last_insert_rowid()', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })[0]

  return row as unknown as WordPractice
}

async function createWordPracticeCompletion(
  wordPracticeId: number,
  status: 'COMPLETED' | 'ABORTED',
  inputText: string,
  characterCount: number,
  missCount: number,
  durationMs: number,
  firstStrokeMs?: number,
  kpm?: number,
  rkpm?: number
): Promise<WordPracticeCompletion> {
  const database = await initDB()

  database.exec(
    `
    INSERT INTO WordPracticeCompletion 
    (wordPracticeId, status, inputText, characterCount, missCount, durationMs, firstStrokeMs, kpm, rkpm) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    {
      bind: [
        wordPracticeId,
        status,
        inputText,
        characterCount,
        missCount,
        durationMs,
        firstStrokeMs,
        kpm,
        rkpm,
      ],
    }
  )

  const row = database.exec('SELECT * FROM WordPracticeCompletion WHERE id = last_insert_rowid()', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })[0]

  return row as unknown as WordPracticeCompletion
}

// 初期データの投入
async function seedInitialData(): Promise<void> {
  const database = await initDB()

  // 既にデータがある場合はスキップ
  const existingTopics = database.exec('SELECT COUNT(*) as count FROM Topic', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })

  if ((existingTopics[0] as any).count > 0) {
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
async function executeQuery(sql: string, params: any[] = []): Promise<unknown[]> {
  const database = await initDB()

  return database.exec(sql, {
    bind: params,
    returnValue: 'resultRows',
    rowMode: 'object',
  })
}

const databaseApi = {
  // Topics
  getTopics,
  getTopic,
  createTopic,

  // Words
  getWordsByTopic,
  getWord,
  createWord,

  // Word Practice
  createWordPractice,
  createWordPracticeCompletion,

  // Data Management
  seedInitialData,

  // Debug
  executeQuery,
}

export type DatabaseApi = typeof databaseApi

Comlink.expose(databaseApi)

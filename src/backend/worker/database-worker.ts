// SQLite WASM + Comlink based Database Worker
import * as Comlink from 'comlink'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import type { Database } from '@sqlite.org/sqlite-wasm'
import { createMigrationTable, runMigrations, resetDatabase as resetDatabaseMigration, seedInitialData } from './database-migration'

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

  // マイグレーション管理テーブルを作成
  createMigrationTable(db)

  // 未実行のマイグレーションを実行
  await runMigrations(db)

  return db
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

// マイグレーション管理用のラッパー関数
async function runMigrationsWrapper(): Promise<void> {
  const database = await initDB()
  await runMigrations(database)
}

async function resetDatabase(): Promise<void> {
  db = await resetDatabaseMigration(db)
}

async function seedInitialDataWrapper(): Promise<void> {
  const database = await initDB()
  await seedInitialData(database)
}

// Worker API - データベース操作とマイグレーション管理
const databaseWorkerApi = {
  // 汎用クエリ実行
  executeQuery,

  // 初期データ投入
  seedInitialData: seedInitialDataWrapper,

  // マイグレーション管理
  runMigrations: runMigrationsWrapper,
  resetDatabase,
}

export type DatabaseWorkerApi = typeof databaseWorkerApi

Comlink.expose(databaseWorkerApi)

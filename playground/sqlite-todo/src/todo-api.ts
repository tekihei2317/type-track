// SQLite WASM + Comlink based Todo API
import * as Comlink from 'comlink'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import type { Database } from '@sqlite.org/sqlite-wasm'

export interface Todo {
  id: number
  text: string
  completed: boolean
  created_at: string
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
    db = new sqlite3.oo1.OpfsDb('/todo-app.db')
  } else {
    console.log('OPFS not available, using memory database')
    db = new sqlite3.oo1.DB()
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  return db
}

async function getTodos(): Promise<Todo[]> {
  const database = await initDB()

  const rows = database.exec('SELECT * FROM todos ORDER BY created_at DESC', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })

  // TODO:
  return rows as unknown as Todo[]
}

async function addTodo(text: string): Promise<Todo> {
  const database = await initDB()

  database.exec('INSERT INTO todos (text) VALUES (?)', {
    bind: [text],
  })

  const row = database.exec('SELECT * FROM todos WHERE id = last_insert_rowid()', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })[0]

  // TODO:
  return row as unknown as Todo
}

async function updateTodo(id: number, updates: Partial<Todo>): Promise<void> {
  const database = await initDB()

  const fields = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ')
  const values = Object.values(updates)

  database.exec(`UPDATE todos SET ${fields} WHERE id = ?`, {
    bind: [...values, id],
  })
}

async function deleteTodo(id: number): Promise<void> {
  const database = await initDB()

  database.exec('DELETE FROM todos WHERE id = ?', {
    bind: [id],
  })
}

async function toggleTodo(id: number): Promise<void> {
  const database = await initDB()

  database.exec('UPDATE todos SET completed = NOT completed WHERE id = ?', {
    bind: [id],
  })
}

async function executeQuery(sql: string): Promise<unknown[]> {
  const database = await initDB()

  return database.exec(sql, {
    returnValue: 'resultRows',
    rowMode: 'object',
  })
}

const todoApi = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  executeQuery,
}

export type TodoApi = typeof todoApi

Comlink.expose(todoApi)

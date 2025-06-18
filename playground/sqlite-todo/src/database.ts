import sqlite3InitModule from '@sqlite.org/sqlite-wasm'

export interface Todo {
  id: number
  text: string
  completed: boolean
  created_at: string
}

class DatabaseManager {
  private db: any = null
  private sqlite3: any = null

  async initialize() {
    console.log('Initializing SQLite...')
    this.sqlite3 = await sqlite3InitModule()

    // OPFS (Origin Private File System) サポートをチェック
    if (this.sqlite3.opfs) {
      console.log('Using OPFS for persistence')
      this.db = new this.sqlite3.oo1.OpfsDb('/todo-app.db')
    } else {
      console.log('Using memory database (data will not persist)')
      this.db = new this.sqlite3.oo1.DB()
    }

    await this.createTables()
    console.log('Database initialized successfully')
  }

  private async createTables() {
    const sql = `
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
    this.db.exec(sql)
  }

  async addTodo(text: string): Promise<Todo> {
    const stmt = this.db.prepare('INSERT INTO todos (text) VALUES (?) RETURNING *')
    const result = stmt.get([text])
    stmt.finalize()
    return result as Todo
  }

  async getTodos(): Promise<Todo[]> {
    const stmt = this.db.prepare('SELECT * FROM todos ORDER BY created_at DESC')
    const results = stmt.getAll()
    stmt.finalize()
    return results as Todo[]
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<void> {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ')
    const values = Object.values(updates)

    const stmt = this.db.prepare(`UPDATE todos SET ${fields} WHERE id = ?`)
    stmt.run([...values, id])
    stmt.finalize()
  }

  async deleteTodo(id: number): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?')
    stmt.run([id])
    stmt.finalize()
  }

  async toggleTodo(id: number): Promise<void> {
    const stmt = this.db.prepare('UPDATE todos SET completed = NOT completed WHERE id = ?')
    stmt.run([id])
    stmt.finalize()
  }

  // SQLクエリを直接実行する機能（デバッグ用）
  async executeQuery(sql: string): Promise<any[]> {
    try {
      const stmt = this.db.prepare(sql)
      const results = stmt.getAll()
      stmt.finalize()
      return results
    } catch (error) {
      console.error('Query execution error:', error)
      throw error
    }
  }

  // データベースの状態を確認
  getInfo() {
    return {
      filename: this.db.filename,
      isOpfs: !!this.sqlite3.opfs,
      version: this.sqlite3.version.libVersion,
    }
  }
}

export const dbManager = new DatabaseManager()

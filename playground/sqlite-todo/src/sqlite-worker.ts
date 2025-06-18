// SQLite Worker implementation for OPFS support
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'

let db: any = null
let sqlite3: any = null

const initSQLite = async () => {
  if (sqlite3) return sqlite3
  
  console.log('Initializing SQLite in worker...')
  sqlite3 = await sqlite3InitModule({
    print: console.log,
    printErr: console.error,
  })
  
  console.log('SQLite version:', sqlite3.version.libVersion)
  console.log('OPFS available:', !!sqlite3.opfs)
  
  if (sqlite3.opfs) {
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
  
  return sqlite3
}

// Message handler for worker communication
self.onmessage = async (event) => {
  const { id, method, params } = event.data
  
  try {
    if (!sqlite3) {
      await initSQLite()
    }
    
    let result
    
    switch (method) {
      case 'init':
        result = {
          filename: db.filename,
          isOpfs: !!sqlite3.opfs,
          version: sqlite3.version.libVersion,
        }
        break
        
      case 'addTodo':
        // Insert the todo
        db.exec('INSERT INTO todos (text) VALUES (?)', {
          bind: [params.text]
        })
        
        // Get the last inserted todo
        result = db.exec('SELECT * FROM todos WHERE id = last_insert_rowid()', {
          returnValue: 'resultRows',
          rowMode: 'object'
        })[0]
        break
        
      case 'getTodos':
        result = db.exec('SELECT * FROM todos ORDER BY created_at DESC', {
          returnValue: 'resultRows',
          rowMode: 'object'
        })
        break
        
      case 'updateTodo':
        const fields = Object.keys(params.updates).map(key => `${key} = ?`).join(', ')
        const values = Object.values(params.updates)
        db.exec(`UPDATE todos SET ${fields} WHERE id = ?`, {
          bind: [...values, params.id]
        })
        result = true
        break
        
      case 'deleteTodo':
        db.exec('DELETE FROM todos WHERE id = ?', {
          bind: [params.id]
        })
        result = true
        break
        
      case 'toggleTodo':
        db.exec('UPDATE todos SET completed = NOT completed WHERE id = ?', {
          bind: [params.id]
        })
        result = true
        break
        
      case 'executeQuery':
        result = db.exec(params.sql, {
          returnValue: 'resultRows',
          rowMode: 'object'
        })
        break
        
      default:
        throw new Error(`Unknown method: ${method}`)
    }
    
    self.postMessage({ id, result })
  } catch (error) {
    self.postMessage({ 
      id, 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
}
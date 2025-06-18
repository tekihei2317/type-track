import { useState, useEffect, useCallback } from 'react'
import { todoApi } from './todo-worker'
import type { Todo } from './todo-api'
import './App.css'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sqlQuery, setSqlQuery] = useState('')
  const [queryResult, setQueryResult] = useState<unknown[]>([])

  const loadTodos = useCallback(async () => {
    const todos = await todoApi.getTodos()
    setTodos(todos)
  }, [])

  const initializeApp = useCallback(async () => {
    try {
      await loadTodos()
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadTodos])

  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim() || !todoApi) return

    try {
      await todoApi.addTodo(newTodoText)
      setNewTodoText('')
      await loadTodos()
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      await todoApi.toggleTodo(id)
      await loadTodos()
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id)
      await loadTodos()
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const executeQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sqlQuery.trim()) return

    try {
      const result = await todoApi.executeQuery(sqlQuery)
      setQueryResult(result)
    } catch (error) {
      console.error('Query failed:', error)
      setQueryResult([{ error: (error as Error).message }])
    }
  }

  if (isLoading) {
    return <div>Loading SQLite...</div>
  }

  return (
    <div className="container">
      <h1>SQLite WASM Todo App</h1>

      {/* Database Info */}
      <div className="db-info">
        <h3>Database Info</h3>
        <p>Using SQLite WASM with OPFS persistence</p>
        <p>Worker-based with Comlink communication</p>
      </div>

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={e => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <button type="submit">Add Todo</button>
      </form>

      {/* Todo List */}
      <div className="todo-list">
        <h3>Todos ({todos.length})</h3>
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
            <span className="todo-text">{todo.text}</span>
            <span className="todo-date">{new Date(todo.created_at).toLocaleString()}</span>
            <button onClick={() => deleteTodo(todo.id)} className="delete-btn">
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* SQL Query Interface */}
      <div className="sql-interface">
        <h3>SQL Query Interface</h3>
        <form onSubmit={executeQuery}>
          <textarea
            value={sqlQuery}
            onChange={e => setSqlQuery(e.target.value)}
            placeholder="Enter SQL query... (e.g., SELECT * FROM todos)"
            className="sql-input"
            rows={3}
          />
          <button type="submit">Execute Query</button>
        </form>

        {queryResult.length > 0 && (
          <div className="query-result">
            <h4>Query Result:</h4>
            <pre>{JSON.stringify(queryResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

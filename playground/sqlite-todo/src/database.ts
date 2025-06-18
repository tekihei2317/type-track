export interface Todo {
  id: number
  text: string
  completed: boolean
  created_at: string
}

class DatabaseManager {
  private worker: Worker | null = null
  private messageId = 0
  private pendingMessages = new Map<number, { resolve: (value: any) => void; reject: (error: any) => void }>()
  private dbInfo: any = null

  async initialize() {
    console.log('Initializing SQLite Worker...')
    
    // Create worker from the same origin
    this.worker = new Worker(new URL('./sqlite-worker.ts', import.meta.url), {
      type: 'module'
    })
    
    // Set up message handler
    this.worker.onmessage = (event) => {
      const { id, result, error } = event.data
      const pending = this.pendingMessages.get(id)
      
      if (pending) {
        this.pendingMessages.delete(id)
        if (error) {
          pending.reject(new Error(error))
        } else {
          pending.resolve(result)
        }
      }
    }
    
    // Initialize the database
    this.dbInfo = await this.sendMessage('init')
    console.log('Database initialized successfully', this.dbInfo)
  }

  private async sendMessage(method: string, params?: any): Promise<any> {
    if (!this.worker) {
      throw new Error('Worker not initialized')
    }
    
    const id = ++this.messageId
    
    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, { resolve, reject })
      this.worker!.postMessage({ id, method, params })
    })
  }

  async addTodo(text: string): Promise<Todo> {
    return await this.sendMessage('addTodo', { text })
  }

  async getTodos(): Promise<Todo[]> {
    return await this.sendMessage('getTodos')
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<void> {
    await this.sendMessage('updateTodo', { id, updates })
  }

  async deleteTodo(id: number): Promise<void> {
    await this.sendMessage('deleteTodo', { id })
  }

  async toggleTodo(id: number): Promise<void> {
    await this.sendMessage('toggleTodo', { id })
  }

  async executeQuery(sql: string): Promise<any[]> {
    return await this.sendMessage('executeQuery', { sql })
  }

  getInfo() {
    return this.dbInfo || { filename: 'Unknown', isOpfs: false, version: 'Unknown' }
  }
}

export const dbManager = new DatabaseManager()
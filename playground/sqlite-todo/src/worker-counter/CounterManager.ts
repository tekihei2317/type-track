// TODO: Workerとの通信を管理するクラスを実装してください
//
// 実装する機能:
// - Worker の初期化
// - メッセージの送受信管理
// - Promise ベースのAPI提供
//
// 使用例:
// const counter = new CounterManager()
// await counter.initialize()
// await counter.increment()
// const count = await counter.getCount()

export class CounterManager {
  private worker: Worker | null = null
  private messageId = 0
  private pendingMessages = new Map<
    number,
    { resolve: (value: any) => void; reject: (error: any) => void }
  >()

  async initialize() {
    console.log('Initializing Counter Worker...')

    // Workerを作成
    this.worker = new Worker(new URL('./counter-worker.ts', import.meta.url), { type: 'module' })

    // 🔑 重要: Workerからの返信を受け取る処理
    this.worker.onmessage = event => {
      const { id, result, error } = event.data

      // どのPromiseに対応するかをIDで検索
      const pending = this.pendingMessages.get(id)

      if (pending) {
        // 見つかったらMapから削除
        this.pendingMessages.delete(id)

        if (error) {
          // エラーの場合は reject
          pending.reject(new Error(error))
        } else {
          // 成功の場合は resolve
          pending.resolve(result)
        }
      }
    }

    console.log('Counter Worker initialized')
  }

  private async sendMessage(method: string): Promise<any> {
    if (!this.worker) {
      throw new Error('Worker not initialized')
    }

    const id = ++this.messageId

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, { resolve, reject })

      this.worker!.postMessage({ id, method })
    })
  }

  async increment(): Promise<number> {
    return await this.sendMessage('increment')
  }

  async decrement(): Promise<number> {
    return await this.sendMessage('decrement')
  }

  async reset(): Promise<number> {
    return await this.sendMessage('reset')
  }

  async getCount(): Promise<number> {
    return await this.sendMessage('getCount')
  }
}

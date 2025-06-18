// Comlinkを使った簡潔なWorker実装
import * as Comlink from 'comlink'

// 🔑 Step 1: 型定義をエクスポート
export class Counter {
  private count = 0

  // 普通のメソッドとして実装
  increment(): number {
    this.count++
    console.log('Worker(Comlink): increment', this.count)
    return this.count
  }

  decrement(): number {
    this.count--
    console.log('Worker(Comlink): decrement', this.count)
    return this.count
  }

  reset(): number {
    this.count = 0
    console.log('Worker(Comlink): reset', this.count)
    return this.count
  }

  getCount(): number {
    console.log('Worker(Comlink): getCount', this.count)
    return this.count
  }
}

const counter = new Counter()

Comlink.expose(counter)

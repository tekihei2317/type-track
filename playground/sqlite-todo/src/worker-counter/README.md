# Worker Counter 実装練習

このディレクトリには、Web Workerを使ったカウンター機能を実装するためのボイラープレートが含まれています。

## 実装手順

### 1. Worker側の実装 (`counter-worker.ts`)
以下のメソッドを実装してください：

```typescript
case 'increment':
  count++
  result = count
  break

case 'decrement':
  count--
  result = count
  break

case 'reset':
  count = 0
  result = count
  break

case 'getCount':
  result = count
  break
```

### 2. Manager側の実装 (`CounterManager.ts`)
Workerとの通信部分を実装してください：

#### Worker初期化
```typescript
this.worker = new Worker(new URL('./counter-worker.ts', import.meta.url), {
  type: 'module'
})
```

#### メッセージ受信
```typescript
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
```

#### メッセージ送信
```typescript
this.pendingMessages.set(id, { resolve, reject })
this.worker.postMessage({ id, method, params })
```

#### API実装
```typescript
async increment(): Promise<number> {
  return await this.sendMessage('increment')
}
```

### 3. UI側の実装 (`CounterApp.tsx`)
React コンポーネントを完成させてください：

#### 初期化
```typescript
await counter.initialize()
const initialCount = await counter.getCount()
setCount(initialCount)
```

#### ボタンハンドラー
```typescript
const newCount = await counter.increment()
setCount(newCount)
```

#### 表示
```tsx
<div style={{ fontSize: '3rem', margin: '2rem 0' }}>
  {count}
</div>
```

## テスト方法

1. 実装完了後、App.tsx で CounterApp をインポート
2. 開発者ツールの Application タブ > Service Workers でWorkerの動作確認
3. ブラウザの Console でエラーがないか確認

## 学習ポイント

- **Worker通信**: postMessage/onmessage の仕組み
- **非同期処理**: Promise ベースのAPI設計
- **状態管理**: Worker内での状態保持
- **エラーハンドリング**: Worker - Main間のエラー伝播

## 次のステップ

CounterがWorkerで動作することを確認できたら：
1. Comlinkを使った実装に書き換えてみる
2. より複雑な状態（配列やオブジェクト）を扱ってみる
3. SQLite Workerの仕組みを理解する
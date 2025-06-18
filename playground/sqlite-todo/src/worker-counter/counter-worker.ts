// カウンターの状態を保持する変数
let count = 0

// メッセージハンドラー
self.onmessage = async event => {
  const { id, method } = event.data

  try {
    let result

    switch (method) {
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

      default:
        throw new Error(`Unknown method: ${method}`)
    }

    // 結果をメインスレッドに送信
    self.postMessage({ id, result })
  } catch (error) {
    // エラーをメインスレッドに送信
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

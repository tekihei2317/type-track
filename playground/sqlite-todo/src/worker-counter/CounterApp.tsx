// TODO: カウンターのUIコンポーネントを実装してください
//
// 実装する機能:
// - カウンター値の表示
// - Increment, Decrement, Reset ボタン
// - Worker の初期化
//
// 使用例:
// <CounterApp />

import { useState, useEffect } from 'react'
import { CounterManager } from './CounterManager'

export function CounterApp() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [counter] = useState(() => new CounterManager())

  useEffect(() => {
    const initCounter = async () => {
      try {
        await counter.initialize()
        const initialCount = await counter.getCount()
        setCount(initialCount)
      } catch (error) {
        console.error('Failed to initialize counter:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initCounter()
  }, [counter])

  const handleIncrement = async () => {
    try {
      setCount(await counter.increment())
    } catch (error) {
      console.error('Failed to increment:', error)
    }
  }

  const handleDecrement = async () => {
    try {
      setCount(await counter.decrement())
    } catch (error) {
      console.error('Failed to decrement:', error)
    }
  }

  const handleReset = async () => {
    try {
      setCount(await counter.reset())
    } catch (error) {
      console.error('Failed to reset:', error)
    }
  }

  if (isLoading) {
    return <div>Loading Counter Worker...</div>
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Worker Counter</h2>

      <div style={{ fontSize: '3rem', margin: '2rem 0' }}>{count}</div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={handleIncrement}>+1</button>

        <button onClick={handleDecrement}>-1</button>

        <button onClick={handleReset}>Reset</button>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
        このカウンターはWeb Workerで動作しています
      </div>
    </div>
  )
}

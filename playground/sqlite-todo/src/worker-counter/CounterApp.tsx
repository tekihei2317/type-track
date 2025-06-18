import { useCounter } from './useCounter'

export function CounterApp() {
  const { count, isLoading, increment, decrement, reset } = useCounter()

  if (isLoading) {
    return <div>Loading Counter Worker...</div>
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Worker Counter</h2>

      <div style={{ fontSize: '3rem', margin: '2rem 0' }}>{count}</div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
        このカウンターはWeb Workerで動作しています
      </div>
    </div>
  )
}

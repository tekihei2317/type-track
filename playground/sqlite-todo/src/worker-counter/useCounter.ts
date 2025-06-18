import * as Comlink from 'comlink'
import type { Remote } from 'comlink'
import { useState, useEffect, useRef } from 'react'
import type { Counter } from './counter-worker-comlink'

export function useCounter() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const counterRef = useRef<Remote<Counter> | null>(null)

  useEffect(() => {
    const initCounter = async () => {
      const worker = new Worker(new URL('./counter-worker-comlink.ts', import.meta.url), {
        type: 'module',
      })
      const counter = Comlink.wrap<Counter>(worker)
      setCount(await counter.getCount())
      setIsLoading(false)
      counterRef.current = counter
    }

    initCounter()
  }, [])

  const increment = async () => {
    if (counterRef.current) {
      setCount(await counterRef.current.increment())
    }
  }

  const decrement = async () => {
    if (counterRef.current) {
      setCount(await counterRef.current.decrement())
    }
  }

  const reset = async () => {
    if (counterRef.current) {
      setCount(await counterRef.current.reset())
    }
  }

  return {
    count,
    isLoading,
    increment,
    decrement,
    reset,
  }
}

import { useState, useCallback } from 'react'

export type Keystroke = {
  key: string
  time: number
}

export type KeystrokeData = {
  expectedRoman: string
  strokes: Keystroke[]
}

export function useKeystrokes(expectedRoman: string) {
  const [keystrokeData, setKeystrokeData] = useState<KeystrokeData>({
    expectedRoman,
    strokes: [],
  })

  const addKeystroke = useCallback((key: string, time: number) => {
    setKeystrokeData(prev => ({
      ...prev,
      strokes: [...prev.strokes, { key, time }],
    }))
  }, [])

  const resetKeystrokes = useCallback((newExpectedRoman: string) => {
    setKeystrokeData({
      expectedRoman: newExpectedRoman,
      strokes: [],
    })
  }, [])

  const updateExpectedRoman = useCallback((newExpectedRoman: string) => {
    setKeystrokeData(prev => ({
      ...prev,
      expectedRoman: newExpectedRoman,
    }))
  }, [])

  return {
    keystrokeData,
    addKeystroke,
    resetKeystrokes,
    updateExpectedRoman,
  }
}
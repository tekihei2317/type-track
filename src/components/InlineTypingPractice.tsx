import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeChecker } from '../utils/typingChecker'
import type { Word } from '../types'

type InlineTypingPracticeProps = {
  word: Word
  onComplete?: (result: { correct: boolean; kpm?: number }) => void
  isActive?: boolean
}

type WordInputState = {
  currentKana: string
  currentRoman: string
  expectedRoman: string
}

export function InlineTypingPractice({
  word,
  onComplete,
  isActive = false,
}: InlineTypingPracticeProps) {
  const checker = useRef(initializeChecker({ word: word.reading }))
  const [startTime, setStartTime] = useState<number>(0)
  const [hasStarted, setHasStarted] = useState(false)

  const [inputState, setInputState] = useState<WordInputState>({
    currentKana: '',
    currentRoman: '',
    expectedRoman: checker.current.expected,
  })

  // ワードが変更されたらチェッカーをリセット
  useEffect(() => {
    checker.current = initializeChecker({ word: word.reading })
    setStartTime(0)
    setHasStarted(false)
    setInputState({
      currentKana: '',
      currentRoman: '',
      expectedRoman: checker.current.expected,
    })
  }, [word, checker])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return

      // 特殊キーは無視
      if (event.key.length > 1 && event.key !== 'Backspace') {
        return
      }

      // Backspaceは無視（簡略化）
      if (event.key === 'Backspace') {
        return
      }

      // 最初の入力で練習開始
      if (!hasStarted) {
        setHasStarted(true)
        setStartTime(Date.now())
      }

      // 入力処理
      const result = checker.current.setCharacter(event.key)
      if (result.correct) {
        setInputState({
          currentKana: checker.current.currentKana,
          currentRoman: checker.current.currentRoman,
          expectedRoman: checker.current.expected,
        })
        // TODO: ワードの入力が完了したら次に進む？
      }
    },
    [checker, isActive, hasStarted]
  )

  // キーボードイベントリスナーを設定
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyPress)
      return () => {
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [handleKeyPress, isActive])

  return (
    <div className="space-y-3">
      {/* ひらがな表示 */}
      <div className="font-mono text-lg">
        <span className="text-green-600">{inputState.currentKana}</span>
        <span className="text-gray-400">{word.reading.slice(inputState.currentKana.length)}</span>
      </div>

      {/* ローマ字表示 */}
      <div className="font-mono text-sm text-gray-600">
        <span className="text-green-600">{inputState.currentRoman}</span>
        <span className="text-gray-400">{inputState.expectedRoman}</span>
      </div>
    </div>
  )
}

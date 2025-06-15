import { useState, useEffect, useCallback } from 'react'
import { createTypingChecker, type TypingChecker } from '../utils/typingChecker'
import type { Word } from '../types'

type InlineTypingPracticeProps = {
  word: Word
  onComplete?: (result: { correct: boolean; kpm?: number }) => void
  isActive?: boolean
}

export function InlineTypingPractice({
  word,
  onComplete,
  isActive = false,
}: InlineTypingPracticeProps) {
  const [checker, setChecker] = useState<TypingChecker>(() => createTypingChecker(word.reading))
  const [startTime, setStartTime] = useState<number>(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [totalInputs, setTotalInputs] = useState(0)
  const [correctInputs, setCorrectInputs] = useState(0)

  // ワードが変更されたらチェッカーをリセット
  useEffect(() => {
    const newChecker = createTypingChecker(word.reading)
    setChecker(newChecker)
    setStartTime(0)
    setHasStarted(false)
    setTotalInputs(0)
    setCorrectInputs(0)
  }, [word])

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
      const result = checker.inputChar(event.key)
      setTotalInputs(prev => prev + 1)

      if (result.correct) {
        setCorrectInputs(prev => prev + 1)
      }

      // 完了チェック
      if (result.completed && onComplete) {
        const endTime = Date.now()
        const duration = endTime - startTime
        const kpm = Math.round((word.reading.length / (duration / 1000)) * 60)

        onComplete({
          correct: true,
          kpm: kpm,
        })
      }
    },
    [checker, isActive, hasStarted, startTime, word, onComplete]
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

  const state = checker.getCurrentState()

  return (
    <div className="space-y-3">
      {/* ひらがな表示 */}
      <div className="font-mono text-lg">
        <span className="text-green-600">{state.typedPart}</span>
        <span className="bg-blue-200 px-1">{state.currentChar}</span>
        <span className="text-gray-400">{state.remainingPart}</span>
      </div>

      {/* ローマ字表示 */}
      <div className="font-mono text-sm text-gray-600">
        <span className="text-green-600">{state.typedRoman}</span>
        <span className="bg-yellow-200 px-1">{state.currentRoman}</span>
        <span className="text-gray-400">{state.remainingRoman}</span>
      </div>

      {/* 状態表示 */}
      {isActive && (
        <div className="text-xs text-gray-500">
          {!hasStarted ? 'キーを押して開始' : `入力中... ${correctInputs}/${totalInputs}`}
        </div>
      )}
    </div>
  )
}

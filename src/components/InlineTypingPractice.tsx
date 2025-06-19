import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeChecker } from '../utils/typingChecker'
import { useKeystrokes } from '../hooks/useKeystrokes'
import { KeystrokeBarChart } from './KeystrokeBarChart'
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
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(0)

  const [inputState, setInputState] = useState<WordInputState>({
    currentKana: '',
    currentRoman: '',
    expectedRoman: checker.current.expected,
  })

  const { keystrokeData, addKeystroke, resetKeystrokes, updateExpectedRoman } = useKeystrokes(
    checker.current.expected
  )

  // ワードが変更されたらチェッカーをリセット
  useEffect(() => {
    checker.current = initializeChecker({ word: word.reading })
    setStartTime(0)
    setHasStarted(false)
    setLastKeystrokeTime(0)
    setInputState({
      currentKana: '',
      currentRoman: '',
      expectedRoman: checker.current.expected,
    })
    resetKeystrokes(checker.current.expected)
  }, [word, checker, resetKeystrokes])

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
        setLastKeystrokeTime(Date.now())
      }

      // 入力処理
      const result = checker.current.setCharacter(event.key)
      if (result.correct) {
        const currentTime = Date.now()
        const keystrokeTime = currentTime - lastKeystrokeTime

        // キーストロークを記録
        addKeystroke(event.key, keystrokeTime)
        setLastKeystrokeTime(currentTime)

        // 入力状態を更新
        setInputState({
          currentKana: checker.current.currentKana,
          currentRoman: checker.current.currentRoman,
          expectedRoman: checker.current.expected,
        })

        // 期待されるローマ字が変更された場合は更新
        updateExpectedRoman(checker.current.expected)

        // TODO: ワードの入力が完了したら次に進む？
      }
    },
    [checker, isActive, hasStarted, lastKeystrokeTime, addKeystroke, updateExpectedRoman]
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
    <div className="space-y-6">
      {/* 入力表示 */}
      <div className="space-y-3">
        {/* ひらがな表示 */}
        <div className="font-mono text-lg text-center tracking-wider">
          <span className="text-green-600">{inputState.currentKana}</span>
          <span className="text-gray-400">{word.reading.slice(inputState.currentKana.length)}</span>
        </div>

        {/* ローマ字表示 */}
        <div className="font-mono text-sm text-gray-600 text-center tracking-wide">
          <span className="text-green-600">{inputState.currentRoman}</span>
          <span className="text-gray-400">{inputState.expectedRoman}</span>
        </div>
      </div>

      {/* リアルタイムグラフ */}
      {hasStarted && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <KeystrokeBarChart keystrokeData={keystrokeData} height={180} />
          </div>
        </div>
      )}
    </div>
  )
}

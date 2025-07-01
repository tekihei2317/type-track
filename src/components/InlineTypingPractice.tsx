import { useState, useEffect, useCallback, useRef } from 'react'
import { initializeChecker } from '../utils/typing-checker'
import { useKeystrokes } from '../hooks/use-keystrokes'
import { KeystrokeBarChart } from './KeystrokeBarChart'
import { useEffectEvent } from '../utils/use-effect-event'
import { wordPracticeRouter } from '../backend/word-practice-router'
import type { Word } from '../types'

type InlineTypingPracticeProps = {
  word: Word
  onComplete?: (result: { correct: boolean; kpm?: number; totalTime?: number; wordCompleted?: boolean }) => void
  onStatsUpdate?: (stats: { rkpm: number; elapsedTime: number; mistakeCount: number }) => void
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
  onStatsUpdate,
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

  // ミス状態の管理
  const [hasMistake, setHasMistake] = useState(false)

  // リアルタイム統計の管理
  const [stats, setStats] = useState({
    rkpm: 0,
    elapsedTime: 0,
    mistakeCount: 0,
  })

  // ワード練習記録のID
  const [wordPracticeId, setWordPracticeId] = useState<number | null>(null)

  const { keystrokeData, addKeystroke, resetKeystrokes, updateExpectedRoman } = useKeystrokes(
    checker.current.expected
  )

  // ワードが変更されたらチェッカーをリセット
  useEffect(() => {
    checker.current = initializeChecker({ word: word.reading })
    setStartTime(0)
    setHasStarted(false)
    setLastKeystrokeTime(0)
    setHasMistake(false)
    setWordPracticeId(null)
    setStats({
      rkpm: 0,
      elapsedTime: 0,
      mistakeCount: 0,
    })
    setInputState({
      currentKana: '',
      currentRoman: '',
      expectedRoman: checker.current.expected,
    })
    resetKeystrokes(checker.current.expected)
  }, [word, checker, resetKeystrokes])

  // useEffectEventで統計更新処理を依存配列から分離
  const updateStats = useEffectEvent(() => {
    // 練習が開始されていない、またはstartTimeが0の場合は統計更新をスキップ
    if (!hasStarted || startTime === 0) return

    const currentTime = Date.now()
    const elapsedTime = currentTime - startTime

    // 初速（最初の1キーストローク）を除いたrkpmを計算
    const typedKeystrokes = inputState.currentRoman.length
    const rkpmTime = typedKeystrokes > 1 ? elapsedTime : 0
    const rkpm =
      typedKeystrokes > 1 && rkpmTime > 0 ? ((typedKeystrokes - 1) / rkpmTime) * 60000 : 0

    const newStats = {
      rkpm: Math.round(rkpm),
      elapsedTime: elapsedTime,
      mistakeCount: stats.mistakeCount,
    }

    setStats(prev => ({
      ...prev,
      ...newStats,
    }))

    onStatsUpdate?.(newStats)
  })

  // リアルタイム統計を0.1秒ごとに更新
  useEffect(() => {
    if (!hasStarted || !isActive || startTime === 0) return

    const interval = setInterval(updateStats, 100) // 0.1秒ごと

    return () => clearInterval(interval)
  }, [hasStarted, isActive, startTime, updateStats])

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

        // 統計をリセット
        const resetStats = {
          rkpm: 0,
          elapsedTime: 0,
          mistakeCount: 0,
        }
        setStats(resetStats)
        onStatsUpdate?.(resetStats)

        // ワード練習レコードを作成
        wordPracticeRouter
          .startWordPractice({ wordId: word.id })
          .then(result => {
            setWordPracticeId(result.wordPracticeId)
            console.log('Started word practice:', result.wordPracticeId)
          })
          .catch(error => {
            console.error('Failed to start word practice:', error)
          })
      }

      // 入力処理
      const result = checker.current.setCharacter(event.key)
      if (result.correct) {
        const currentTime = Date.now()
        const keystrokeTime = currentTime - lastKeystrokeTime

        // ミス状態をクリア
        setHasMistake(false)

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

        // ワードの入力が完了したかチェック
        if (checker.current.currentKana === word.reading) {
          // ワード完了時の処理
          const totalTime = currentTime - startTime
          const kpm = totalTime > 0 ? (inputState.currentRoman.length / totalTime) * 60000 : 0
          const rkpm =
            inputState.currentRoman.length > 1 && totalTime > 0
              ? ((inputState.currentRoman.length - 1) / totalTime) * 60000
              : 0

          // WordPracticeCompletionレコードを作成
          if (wordPracticeId) {
            wordPracticeRouter
              .completeWordPractice({
                wordPracticeId,
                status: 'COMPLETED',
                inputText: inputState.currentRoman,
                characterCount: inputState.currentRoman.length,
                missCount: stats.mistakeCount,
                durationMs: totalTime,
                firstStrokeMs: lastKeystrokeTime - startTime,
                kpm: kpm,
                rkpm: rkpm,
                keystrokeTimes: keystrokeData.strokes.map(stroke => ({
                  key: stroke.key,
                  time: stroke.time,
                  correct: true, // TODO: 正誤情報を追加
                })),
              })
              .then(() => {
                console.log('Completed word practice:', wordPracticeId)
              })
              .catch(error => {
                console.error('Failed to complete word practice:', error)
              })
          }

          onComplete?.({
            correct: true,
            kpm: kpm,
            totalTime: totalTime,
            wordCompleted: true,
          })
        }
      } else {
        // ミス時の処理
        setHasMistake(true)
        setStats(prev => {
          const newMistakeCount = prev.mistakeCount + 1
          const newStats = {
            rkpm: prev.rkpm,
            elapsedTime: prev.elapsedTime,
            mistakeCount: newMistakeCount,
          }
          onStatsUpdate?.(newStats)
          return {
            ...prev,
            mistakeCount: newMistakeCount,
          }
        })
      }
    },
    [
      checker,
      isActive,
      hasStarted,
      lastKeystrokeTime,
      addKeystroke,
      updateExpectedRoman,
      word.reading,
      word.id,
      startTime,
      onComplete,
      onStatsUpdate,
      inputState.currentRoman,
      stats.mistakeCount,
      wordPracticeId,
      keystrokeData.strokes,
    ]
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
          {hasMistake && inputState.expectedRoman.length > 0 ? (
            <>
              <span className="text-red-600 bg-red-100">{inputState.expectedRoman[0]}</span>
              <span className="text-gray-400">{inputState.expectedRoman.slice(1)}</span>
            </>
          ) : (
            <span className="text-gray-400">{inputState.expectedRoman}</span>
          )}
        </div>
      </div>

      {/* リアルタイムグラフ */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border p-4">
          <KeystrokeBarChart keystrokeData={keystrokeData} height={180} />
        </div>
      </div>
    </div>
  )
}

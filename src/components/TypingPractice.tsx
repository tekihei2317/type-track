import { useState, useEffect, useCallback } from 'react'
import { createTypingChecker, type TypingChecker } from '../utils/typingChecker'
import type { Word } from '../types'

type TypingPracticeProps = {
  word: Word
  onComplete?: (result: TypingResult) => void
  onSkip?: () => void
}

export type TypingResult = {
  word: Word
  completed: boolean
  startTime: number
  endTime: number
  totalInputs: number
  correctInputs: number
  mistakes: number
  kpm: number
}

export function TypingPractice({ word, onComplete, onSkip }: TypingPracticeProps) {
  const [checker, setChecker] = useState<TypingChecker>(() => createTypingChecker(word.reading))
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [totalInputs, setTotalInputs] = useState(0)
  const [correctInputs, setCorrectInputs] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [lastInputCorrect, setLastInputCorrect] = useState(true)

  // ワードが変更されたらチェッカーをリセット
  useEffect(() => {
    const newChecker = createTypingChecker(word.reading)
    setChecker(newChecker)
    setIsActive(false)
    setStartTime(0)
    setTotalInputs(0)
    setCorrectInputs(0)
    setMistakes(0)
    setLastInputCorrect(true)
  }, [word])

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // 特殊キーは無視
    if (event.key.length > 1 && event.key !== 'Backspace') {
      return
    }

    // Escキーでスキップ
    if (event.key === 'Escape' && onSkip) {
      onSkip()
      return
    }

    // Backspaceは無視（簡略化）
    if (event.key === 'Backspace') {
      return
    }

    // 最初の入力で練習開始
    if (!isActive) {
      setIsActive(true)
      setStartTime(Date.now())
    }

    // 入力処理
    const result = checker.inputChar(event.key)
    setTotalInputs(prev => prev + 1)
    
    if (result.correct) {
      setCorrectInputs(prev => prev + 1)
      setLastInputCorrect(true)
    } else {
      setMistakes(prev => prev + 1)
      setLastInputCorrect(false)
    }

    // 完了チェック
    if (result.completed && onComplete) {
      const endTime = Date.now()
      const duration = endTime - startTime
      const kpm = Math.round((word.reading.length / (duration / 1000)) * 60)
      
      const typingResult: TypingResult = {
        word,
        completed: true,
        startTime,
        endTime,
        totalInputs: totalInputs + 1,
        correctInputs: correctInputs + (result.correct ? 1 : 0),
        mistakes: mistakes + (result.correct ? 0 : 1),
        kpm
      }
      
      onComplete(typingResult)
    }
  }, [checker, isActive, startTime, totalInputs, correctInputs, mistakes, word, onComplete, onSkip])

  // キーボードイベントリスナーを設定
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const state = checker.getCurrentState()
  const accuracy = totalInputs > 0 ? Math.round((correctInputs / totalInputs) * 100) : 100

  return (
    <div className="space-y-6 focus:outline-none" tabIndex={0}>
      {/* 練習中のワード表示 */}
      <div className="text-center py-8">
        <div className="text-2xl font-bold text-gray-900 mb-2">{word.text}</div>
        <div className="text-gray-600 mb-6">{word.reading}</div>
        
        {/* タイピング表示エリア */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 font-mono text-2xl">
          <div className="min-h-[3rem] flex items-center justify-center">
            <span className="text-green-600">{state.typedPart}</span>
            <span className={`bg-blue-200 ${lastInputCorrect ? '' : 'bg-red-200'}`}>
              {state.currentChar}
            </span>
            <span className="text-gray-400">{state.remainingPart}</span>
          </div>
        </div>
        
        {/* 期待される入力表示 */}
        <div className="mt-2 text-sm text-gray-500">
          入力: {checker.currentInput}
        </div>
      </div>

      {/* 統計情報 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">リアルタイム統計</h4>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isActive && startTime > 0 
                ? Math.round((word.reading.length / ((Date.now() - startTime) / 1000)) * 60) 
                : '-'}
            </div>
            <div className="text-sm text-gray-600">KPM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-gray-600">正確性</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{mistakes}</div>
            <div className="text-sm text-gray-600">ミス数</div>
          </div>
        </div>
      </div>

      {/* 操作ガイド */}
      <div className="text-center text-sm text-gray-500">
        {!isActive ? (
          <p>何かキーを押して練習を開始してください</p>
        ) : (
          <p>Escキーで次のワードにスキップ</p>
        )}
      </div>
    </div>
  )
}
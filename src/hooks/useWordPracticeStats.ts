import { useState, useEffect, useMemo } from 'react'
import { wordPracticeRouter } from '../backend/word-practice-router'

export type WordStats = {
  wordId: number
  averageRkpm?: number
  totalPractices: number
  noMissPractices: number
  stabilityRate: number // 安定打率（0-1）
}

export function useWordPracticeStats(wordIds: number[]) {
  const [wordStats, setWordStats] = useState<Map<number, WordStats>>(new Map())
  const [loading, setLoading] = useState(false)

  // wordIdsの配列を安定化
  const stableWordIds = useMemo(() => wordIds, [JSON.stringify(wordIds)])

  useEffect(() => {
    if (stableWordIds.length === 0) {
      setWordStats(new Map())
      return
    }

    setLoading(true)

    wordPracticeRouter
      .getMultipleWordStats({ wordIds: stableWordIds })
      .then(results => {
        const statsMap = new Map<number, WordStats>()

        results.forEach(stat => {
          // 安定打率をフロントエンドで計算
          const stabilityRate =
            stat.totalPractices > 0 ? stat.noMissPractices / stat.totalPractices : 0

          const wordStats: WordStats = {
            wordId: stat.wordId,
            averageRkpm: stat.averageRkpm,
            totalPractices: stat.totalPractices,
            noMissPractices: stat.noMissPractices,
            stabilityRate,
          }

          statsMap.set(stat.wordId, wordStats)
        })

        // データが取得できなかったワードのために空の統計を作成
        stableWordIds.forEach(wordId => {
          if (!statsMap.has(wordId)) {
            statsMap.set(wordId, {
              wordId,
              averageRkpm: undefined,
              totalPractices: 0,
              noMissPractices: 0,
              stabilityRate: 0,
            })
          }
        })

        setWordStats(statsMap)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load word practice stats:', error)
        setLoading(false)
      })
  }, [stableWordIds])

  const getWordStats = (wordId: number): WordStats | undefined => {
    return wordStats.get(wordId)
  }

  return { wordStats, loading, getWordStats }
}

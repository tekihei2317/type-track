import { useState, useEffect } from 'react'
import type { Topic, Word } from '../types'
import { databaseApi } from '../database/database-worker'

export function useTopicsDataDB() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // データベースからお題一覧を取得
        const loadedTopics = await databaseApi.getTopics()

        // 各お題のワードを取得
        const allWords: Word[] = []
        for (const topic of loadedTopics) {
          const topicWords = await databaseApi.getWordsByTopic(topic.id)
          allWords.push(...topicWords)
        }

        setTopics(loadedTopics)
        setWords(allWords)
      } catch (err) {
        console.error('Failed to load topics data from database:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return {
    topics,
    words,
    loading,
    error,
    getWordsByTopicId: (topicId: number) => words.filter(word => word.topicId === topicId),
    // データベース関連の追加メソッド
    refresh: async () => {
      setLoading(true)
      try {
        const loadedTopics = await databaseApi.getTopics()
        const allWords: Word[] = []
        for (const topic of loadedTopics) {
          const topicWords = await databaseApi.getWordsByTopic(topic.id)
          allWords.push(...topicWords)
        }
        setTopics(loadedTopics)
        setWords(allWords)
      } catch (err) {
        console.error('Failed to refresh topics data:', err)
        setError(err instanceof Error ? err.message : 'Failed to refresh data')
      } finally {
        setLoading(false)
      }
    },
  }
}

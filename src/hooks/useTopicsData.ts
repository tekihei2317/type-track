import { useState, useEffect } from 'react'
import type { Topic, Word } from '../types'
import { loadAllETypingTopics } from '../utils/dataLoader'
import { sampleTopics, sampleWords } from '../data/sampleData'

export function useTopicsData() {
  const [topics, setTopics] = useState<Topic[]>(sampleTopics)
  const [words, setWords] = useState<Word[]>(sampleWords)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const { topics: loadedTopics, words: loadedWords } = await loadAllETypingTopics()

        // Combine sample data with loaded e-typing data
        const allTopics = [...sampleTopics, ...loadedTopics]
        const allWords = [...sampleWords, ...loadedWords]

        setTopics(allTopics)
        setWords(allWords)
      } catch (err) {
        console.error('Failed to load topics data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        // Keep using sample data if loading fails
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
  }
}

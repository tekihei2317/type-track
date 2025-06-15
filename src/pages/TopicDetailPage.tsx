import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { useTopicsData } from '../hooks/useTopicsData'
import { TypingPractice, type TypingResult } from '../components/TypingPractice'
import type { Word } from '../types'

export function TopicDetailPage() {
  const { topicId } = useParams({ from: '/topics/$topicId' })
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [searchText, setSearchText] = useState('')
  const [practiceMode, setPracticeMode] = useState(false)
  
  const { topics, getWordsByTopicId, loading } = useTopicsData()
  
  const topicIdNum = parseInt(topicId)
  const topic = topics.find(t => t.id === topicIdNum)
  const words = getWordsByTopicId(topicIdNum)
  const filteredWords = words.filter(w => 
    w.text.includes(searchText) || w.reading.includes(searchText)
  )

  const handlePracticeComplete = (result: TypingResult) => {
    console.log('Practice completed:', result)
    setPracticeMode(false)
    // TODO: 結果を保存する
  }

  const handlePracticeSkip = () => {
    setPracticeMode(false)
  }

  const startPractice = (word: Word) => {
    setSelectedWord(word)
    setPracticeMode(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">お題が見つかりません</div>
      </div>
    )
  }

  if (practiceMode && selectedWord) {
    return (
      <div className="space-y-6">
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm font-semibold text-blue-600">基礎練習</span>
              <span className="text-sm text-gray-600">実践練習</span>
            </div>
          </div>
          <button
            onClick={() => setPracticeMode(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
          >
            ワード一覧に戻る
          </button>
        </div>

        <TypingPractice
          word={selectedWord}
          onComplete={handlePracticeComplete}
          onSkip={handlePracticeSkip}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-600">基礎練習</span>
            <span className="text-sm text-gray-600">実践練習</span>
          </div>
        </div>
      </div>

      {/* 練習開始ボタン */}
      {selectedWord && (
        <div className="text-center py-8 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 mb-2">{selectedWord.text}</div>
          <div className="text-gray-600 mb-6">{selectedWord.reading}</div>
          <button
            onClick={() => startPractice(selectedWord)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            練習を開始
          </button>
        </div>
      )}

      {/* 検索とフィルター */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="検索"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>
        <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
          filter
        </button>
        <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
          sort
        </button>
        <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
          limit
        </button>
      </div>

      {/* ワード一覧テーブル */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ワード
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                kpm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                安定打
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWords.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  該当するワードが見つかりません
                </td>
              </tr>
            ) : (
              filteredWords.map((word) => (
                <tr
                  key={word.id}
                  onClick={() => setSelectedWord(word)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedWord?.id === word.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{word.text}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startPractice(word)
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      練習
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
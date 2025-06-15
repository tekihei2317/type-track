import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { sampleTopics, sampleWords } from '../data/sampleData'
import type { Word } from '../types'

export function TopicDetailPage() {
  const { topicId } = useParams({ from: '/topics/$topicId' })
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [searchText, setSearchText] = useState('')

  const topic = sampleTopics.find(t => t.id === parseInt(topicId))
  const words = sampleWords.filter(w => w.topicId === parseInt(topicId))
  const filteredWords = words.filter(w => 
    w.text.includes(searchText) || w.reading.includes(searchText)
  )

  if (!topic) {
    return <div>お題が見つかりません</div>
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

      {/* 練習中のワード表示 */}
      {selectedWord && (
        <div className="text-center py-8">
          <div className="text-3xl font-bold text-gray-900 mb-2">{selectedWord.text}</div>
          <div className="text-gray-600 mb-6">{selectedWord.reading}</div>
          
          {/* グラフエリア（将来実装） */}
          <div className="bg-gray-100 h-32 rounded-lg mb-6 flex items-center justify-center">
            <span className="text-gray-500">グラフ表示エリア</span>
          </div>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWords.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
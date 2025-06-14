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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
        <p className="text-sm text-gray-600 mt-1">基礎練習モード</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: ワード一覧 */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="ワードを検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                onClick={() => setSelectedWord(word)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedWord?.id === word.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{word.text}</div>
                <div className="text-sm text-gray-600">{word.reading}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側: 練習エリア */}
        <div className="space-y-4">
          {selectedWord ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">練習中のワード</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{selectedWord.text}</p>
                  <p className="text-sm text-gray-600">{selectedWord.reading}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    入力してください
                  </label>
                  <input
                    type="text"
                    placeholder="ここに入力..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">統計情報</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">KPM:</span>
                      <span className="font-semibold ml-1">-</span>
                    </div>
                    <div>
                      <span className="text-gray-600">正確性:</span>
                      <span className="font-semibold ml-1">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-600">左側からワードを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
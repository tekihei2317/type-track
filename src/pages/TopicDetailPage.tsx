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
    <div className="space-y-8">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">{topic.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">基礎練習モード</span>
          <span className="text-blue-100">•</span>
          <span className="text-blue-100 text-sm">{filteredWords.length} ワード</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側: ワード一覧 */}
        <div className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ワードを検索..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredWords.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>該当するワードが見つかりません</p>
                </div>
              ) : (
                filteredWords.map((word, index) => (
                  <div
                    key={word.id}
                    onClick={() => setSelectedWord(word)}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      index !== filteredWords.length - 1 ? 'border-b border-gray-100' : ''
                    } ${
                      selectedWord?.id === word.id 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                        : 'hover:bg-gray-50 hover:border-l-4 hover:border-l-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{word.text}</div>
                    <div className="text-sm text-gray-600">{word.reading}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右側: 練習エリア */}
        <div className="space-y-6">
          {selectedWord ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">練習中のワード</h3>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-3xl font-bold text-blue-600 mb-2">{selectedWord.text}</p>
                  <p className="text-gray-600">{selectedWord.reading}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    入力してください
                  </label>
                  <input
                    type="text"
                    placeholder="ここに入力してください..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                  />
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    統計情報
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">-</div>
                      <div className="text-sm text-gray-600 font-medium">KPM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">-</div>
                      <div className="text-sm text-gray-600 font-medium">正確性</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 text-lg font-medium">左側からワードを選択してください</p>
              <p className="text-gray-500 text-sm mt-2">練習を開始するには、まずワードを选択しましょう</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
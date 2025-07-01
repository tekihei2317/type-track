import { useParams, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTopicsDataDB } from '../hooks/useTopicsDataDB'
import { useWordPracticeStats } from '../hooks/useWordPracticeStats'
import { InlineTypingPractice } from '../components/InlineTypingPractice'
import type { Word } from '../types'

export function TopicDetailPage() {
  const { topicId } = useParams({ from: '/topics/$topicId' })
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [searchText, setSearchText] = useState('')
  const [currentStats, setCurrentStats] = useState({
    rkpm: 0,
    elapsedTime: 0,
    mistakeCount: 0,
  })

  const { topics, getWordsByTopicId, loading } = useTopicsDataDB()

  const topicIdNum = parseInt(topicId)
  const topic = topics.find(t => t.id === topicIdNum)
  const words = getWordsByTopicId(topicIdNum)
  const filteredWords = words.filter(
    w => w.text.includes(searchText) || w.reading.includes(searchText)
  )

  // ワードの練習統計を取得
  const { getWordStats, loading: statsLoading } = useWordPracticeStats(filteredWords.map(w => w.id))

  const handleInlineComplete = (
    wordId: number,
    result: { correct: boolean; kpm?: number; wordCompleted?: boolean }
  ) => {
    console.log('Inline practice completed:', wordId, result)
    if (result.wordCompleted) {
      // ワード完了時に次のワードに自動で進む
      const currentIndex = filteredWords.findIndex(w => w.id === wordId)
      if (currentIndex < filteredWords.length - 1) {
        setSelectedWord(filteredWords[currentIndex + 1])
      } else {
        setSelectedWord(null) // 最後のワードが完了
        console.log('All words completed!')
      }
    }
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

      {/* インライン練習エリア */}
      {selectedWord && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="text-xl font-bold text-gray-900">{selectedWord.text}</div>
          </div>
          <InlineTypingPractice
            word={selectedWord}
            onComplete={result => handleInlineComplete(selectedWord.id, result)}
            onStatsUpdate={setCurrentStats}
            isActive={true}
          />

          {/* 統計表示エリア */}
          <div className="mt-4 bg-white rounded-lg border p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">進捗</div>
                <div className="text-lg font-mono font-bold">
                  {filteredWords.findIndex(w => w.id === selectedWord.id) + 1}/
                  {filteredWords.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">RKPM</div>
                <div className="text-lg font-mono font-bold text-blue-600">{currentStats.rkpm}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">時間</div>
                <div className="text-lg font-mono font-bold">
                  {(currentStats.elapsedTime / 1000).toFixed(1)}s
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">ミス</div>
                <div
                  className={`text-lg font-mono font-bold ${currentStats.mistakeCount > 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {currentStats.mistakeCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 検索とフィルター */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="検索"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
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
                RKPM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                安定打
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                挑戦回数
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
              filteredWords.map(word => {
                const stats = getWordStats(word.id)
                return (
                  <tr
                    key={word.id}
                    onClick={() => setSelectedWord(word)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedWord?.id === word.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to="/words/$wordId"
                        params={{ wordId: word.id.toString() }}
                        className="text-sm font-medium  hover:text-blue-600 hover:underline"
                      >
                        {word.text}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {statsLoading ? (
                        <div className="text-gray-400">...</div>
                      ) : stats?.averageRkpm ? (
                        Math.round(stats.averageRkpm)
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {statsLoading ? (
                        <div className="text-gray-400">...</div>
                      ) : stats && stats.totalPractices > 0 ? (
                        `${Math.round(stats.stabilityRate * 100)}%`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {statsLoading ? (
                        <div className="text-gray-400">...</div>
                      ) : (
                        stats?.totalPractices || 0
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

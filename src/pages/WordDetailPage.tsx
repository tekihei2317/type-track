import { useParams, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTopicsDataDB } from '../hooks/useTopicsDataDB'
import { wordPracticeRouter } from '../backend/word-practice-router'
import { KeystrokeBarChart } from '../components/KeystrokeBarChart'
import type { Word } from '../types'

type PracticeRecord = {
  id: number
  wordId: number
  wordText: string
  wordReading: string
  startedAt: string
  status?: string
  durationMs?: number
  kpm?: number
  rkpm?: number
  missCount?: number
}

export function WordDetailPage() {
  const { wordId } = useParams({ from: '/words/$wordId' })
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<PracticeRecord | null>(null)

  const { getWordById } = useTopicsDataDB()
  const wordIdNum = parseInt(wordId)
  const word = getWordById(wordIdNum)

  // 練習記録を取得
  useEffect(() => {
    setLoading(true)
    wordPracticeRouter.getWordPracticeHistory({ wordId: wordIdNum })
      .then(records => {
        setPracticeRecords(records)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load practice records:', error)
        setLoading(false)
      })
  }, [wordIdNum])

  // 統計情報を計算
  const completedRecords = practiceRecords.filter(record => record.status === 'COMPLETED')
  const totalPractices = practiceRecords.length
  const averageRkpm = completedRecords.length > 0 
    ? completedRecords.reduce((sum, record) => sum + (record.rkpm || 0), 0) / completedRecords.length
    : 0
  const noMissRecords = completedRecords.filter(record => record.missCount === 0)
  const stabilityRate = completedRecords.length > 0 ? (noMissRecords.length / completedRecords.length) * 100 : 0

  if (!word) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">ワードが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/topics/$topicId" params={{ topicId: word.topicId.toString() }} className="hover:underline">
              ← お題に戻る
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{word.text}</h1>
          <div className="text-sm text-gray-600 mt-1">{word.reading}</div>
        </div>
      </div>

      {/* 統計サマリ */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">練習サマリ</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">平均RKPM</div>
            <div className="text-2xl font-bold text-blue-600">
              {averageRkpm > 0 ? Math.round(averageRkpm) : '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">安定打</div>
            <div className="text-2xl font-bold text-green-600">
              {stabilityRate > 0 ? `${Math.round(stabilityRate)}%` : '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">挑戦回数</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalPractices}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">完了回数</div>
            <div className="text-2xl font-bold text-gray-900">
              {completedRecords.length}
            </div>
          </div>
        </div>
      </div>

      {/* 練習記録一覧 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">練習履歴</h2>
        </div>
        
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">
            読み込み中...
          </div>
        ) : practiceRecords.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            練習記録がありません
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {practiceRecords.map(record => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                  selectedRecord?.id === record.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        {new Date(record.startedAt).toLocaleString('ja-JP')}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        record.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status === 'COMPLETED' ? '完了' : '未完了'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    {record.rkpm && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">RKPM</div>
                        <div className="font-medium">{Math.round(record.rkpm)}</div>
                      </div>
                    )}
                    {record.durationMs && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">時間</div>
                        <div className="font-medium">{(record.durationMs / 1000).toFixed(1)}s</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-xs text-gray-500">ミス</div>
                      <div className={`font-medium ${record.missCount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {record.missCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 選択された記録の詳細 */}
      {selectedRecord && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">練習詳細</h2>
          <div className="text-sm text-gray-600 mb-4">
            {new Date(selectedRecord.startedAt).toLocaleString('ja-JP')}
          </div>
          {/* TODO: キーストロークの詳細グラフを表示 */}
          <div className="text-sm text-gray-500">
            キーストロークの詳細表示は実装予定です
          </div>
        </div>
      )}
    </div>
  )
}
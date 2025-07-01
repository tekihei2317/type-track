import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useTopicsDataDB } from '../hooks/use-topics-data-db'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { topics, loading, error } = useTopicsDataDB()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-600 mt-1">お題を選択して練習を始めましょう</p>
        <div className="mt-4">
          <Link
            to="/basic-practice-results"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            練習結果を見る
          </Link>
        </div>
      </div>

      {loading && (
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-blue-600">データベースを初期化中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-lg p-8 text-center">
          <div className="text-2xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">エラーが発生しました</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map(topic => (
            <Link
              key={topic.id}
              to="/topics/$topicId"
              params={{ topicId: topic.id.toString() }}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.name}</h3>
              <p className="text-sm text-gray-600">
                作成日: {new Date(topic.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && topics.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">お題がありません</h3>
          <p className="text-gray-600">データベースにお題が登録されていません</p>
        </div>
      )}
    </div>
  )
}

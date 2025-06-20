import { Link } from '@tanstack/react-router'
import { useTopicsDataDB } from '../hooks/useTopicsDataDB'

export function Sidebar() {
  const { topics, loading, error } = useTopicsDataDB()

  // データベースからのお題をすべて表示
  const databaseTopics = topics

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Type Track</h1>

        <nav className="space-y-1">
          <Link to="/" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
            ダッシュボード
          </Link>
          <Link
            to="/review"
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            今日の復習
          </Link>
        </nav>

        {/* Database Topics */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            お題一覧
          </h3>
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">読み込み中...</div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-500">エラー: {error}</div>
          ) : databaseTopics.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">お題がありません</div>
          ) : (
            <nav className="space-y-1">
              {databaseTopics.map(topic => (
                <Link
                  key={topic.id}
                  to="/topics/$topicId"
                  params={{ topicId: topic.id.toString() }}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {topic.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </aside>
  )
}

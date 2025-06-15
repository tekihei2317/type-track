import { Link } from '@tanstack/react-router'
import { useTopicsData } from '../hooks/useTopicsData'

export function Sidebar() {
  const { topics, loading, error } = useTopicsData()
  
  // Separate sample topics and e-typing topics
  const sampleTopics = topics.filter(topic => topic.id < 1000)
  const eTypingTopics = topics.filter(topic => topic.id >= 1000)
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Type Track</h1>
        
        <nav className="space-y-1">
          <Link
            to="/"
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            ダッシュボード
          </Link>
          <Link
            to="/review"
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            今日の復習
          </Link>
        </nav>
        
        {/* Sample Topics */}
        {sampleTopics.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              サンプル
            </h3>
            <nav className="space-y-1">
              {sampleTopics.map((topic) => (
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
          </div>
        )}
        
        {/* E-typing Topics */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            e-typing
          </h3>
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">読み込み中...</div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-500">エラー: {error}</div>
          ) : (
            <nav className="space-y-1">
              {eTypingTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to="/topics/$topicId"
                  params={{ topicId: topic.id.toString() }}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {topic.name.replace(/\(\d+回\)$/, '')}
                </Link>
              ))}
            </nav>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Weather Typing
          </h3>
          <nav className="space-y-1">
            <div className="px-3 py-2 text-sm text-gray-500">準備中</div>
          </nav>
        </div>
      </div>
    </aside>
  )
}
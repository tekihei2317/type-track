import { Link } from '@tanstack/react-router'
import { sampleTopics } from '../data/sampleData'

export function Sidebar() {
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
        
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            e-typing
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
        
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Weather Typing
          </h3>
          <nav className="space-y-1">
            <div className="px-3 py-2 text-sm text-gray-700">公式ワード1</div>
            <div className="px-3 py-2 text-sm text-gray-700">公式ワード2</div>
            <div className="px-3 py-2 text-sm text-gray-700">公式ワード3</div>
            <div className="px-3 py-2 text-sm text-gray-700">公式ワード4</div>
          </nav>
        </div>
      </div>
    </aside>
  )
}
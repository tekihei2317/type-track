import { Link } from '@tanstack/react-router'
import { sampleTopics } from '../data/sampleData'

export function HomePage() {
  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Type Track
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            効率的なタイピング練習で、あなたのスキルを次のレベルへ
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium">
            ✨ 反復練習システム
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium">
            📊 詳細な分析機能
          </div>
          <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full font-medium">
            🎯 カスタマイズ可能
          </div>
        </div>
      </div>

      {/* お題一覧セクション */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">練習お題</h2>
          <p className="text-gray-600">お好みのお題を選んで、タイピング練習を始めましょう</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTopics.map((topic) => (
            <Link
              key={topic.id}
              to="/topics/$topicId"
              params={{ topicId: topic.id.toString() }}
              className="group block"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {topic.name.charAt(0)}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      基礎練習モードで効率的にスキルアップ
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      ワード練習
                    </div>
                    <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 機能紹介セクション */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Type Trackの特徴</h2>
          <p className="text-gray-600">効率的な練習で、確実にスキルアップ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">🔄</div>
            </div>
            <h3 className="font-bold text-gray-900">反復練習システム</h3>
            <p className="text-sm text-gray-600">
              苦手なワードを効率的に反復練習し、着実にスキルアップ
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">📈</div>
            </div>
            <h3 className="font-bold text-gray-900">詳細な分析</h3>
            <p className="text-sm text-gray-600">
              KPMや正確性を詳細に分析し、弱点を明確に把握
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">⚙️</div>
            </div>
            <h3 className="font-bold text-gray-900">カスタマイズ</h3>
            <p className="text-sm text-gray-600">
              お好みの設定で、あなただけの練習環境を構築
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
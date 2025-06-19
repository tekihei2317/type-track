export function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-600 mt-1">
          左側のメニューからお題を選択して練習を始めましょう
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">👈</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">お題を選択してください</h3>
        <p className="text-gray-600">
          左側のサイドバーからお好みのお題を選んで、タイピング練習を始めましょう
        </p>
      </div>
    </div>
  )
}

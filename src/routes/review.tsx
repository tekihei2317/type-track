import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/review')({
  component: ReviewPage,
})

function ReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">今日の復習</h1>
        <p className="text-sm text-gray-600 mt-1">復習が必要なワードを練習しましょう</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">復習機能は準備中です</h3>
        <p className="text-gray-600">
          将来的に、間違えたワードや練習が必要なワードが自動的に表示されます
        </p>
      </div>
    </div>
  )
}

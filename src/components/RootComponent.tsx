import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Sidebar } from './Sidebar'

export function RootComponent() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* サイドバー */}
        <Sidebar />

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search"
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">Cmd K</span>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <TanStackRouterDevtools />
    </div>
  )
}

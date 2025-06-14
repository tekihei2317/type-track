import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootComponent } from './components/RootComponent'
import { HomePage } from './pages/HomePage'
import { TopicDetailPage } from './pages/TopicDetailPage'

export const rootRoute = createRootRoute({
  component: RootComponent,
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

export const topicDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topics/$topicId',
  component: TopicDetailPage,
})

export const routeTree = rootRoute.addChildren([indexRoute, topicDetailRoute])
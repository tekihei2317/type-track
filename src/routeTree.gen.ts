import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootComponent } from './components/RootComponent'
import { HomePage } from './pages/HomePage'
import { TopicDetailPage } from './pages/TopicDetailPage'
import { ReviewPage } from './pages/ReviewPage'

export const rootRoute = createRootRoute({
  component: RootComponent,
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

export const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
})

export const topicDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topics/$topicId',
  component: TopicDetailPage,
})

export const routeTree = rootRoute.addChildren([indexRoute, reviewRoute, topicDetailRoute])
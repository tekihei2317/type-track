import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootComponent } from './components/RootComponent'
import { HomePage } from './pages/HomePage'
import { TopicDetailPage } from './pages/TopicDetailPage'
import { WordDetailPage } from './pages/WordDetailPage'
import { ReviewPage } from './pages/ReviewPage'
import { BasicPracticeResultsPage } from './pages/BasicPracticeResultsPage'

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

export const wordDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/words/$wordId',
  component: WordDetailPage,
})

export const basicPracticeResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/basic-practice-results',
  component: BasicPracticeResultsPage,
})

export const routeTree = rootRoute.addChildren([indexRoute, reviewRoute, topicDetailRoute, wordDetailRoute, basicPracticeResultsRoute])

// Type-Track Backend API
// 全routerの集約とエクスポート

export { topicRouter } from './topic-router'
export { wordRouter } from './word-router'
export { wordPracticeRouter } from './word-practice-router'
export { database, migrationApi } from './database/database'
export type { DatabaseWorkerProxy } from './database/database'

// メインAPI - 全routerを集約
export const api = {
  topic: () => import('./topic-router').then(m => m.topicRouter),
  word: () => import('./word-router').then(m => m.wordRouter),
  wordPractice: () => import('./word-practice-router').then(m => m.wordPracticeRouter),
}

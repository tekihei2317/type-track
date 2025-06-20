// データベースから取得したデータの型を定義

export interface Topic {
  id: number
  name: string
  createdAt: string
}

export interface Word {
  id: number
  topicId: number
  text: string
  reading: string
  createdAt: string
}

export interface WordPractice {
  id: number
  wordId: number
  startedAt: string
  keystrokeTimes: string
}

export interface WordPracticeCompletion {
  id: number
  wordPracticeId: number
  status: 'COMPLETED' | 'ABORTED'
  inputText: string
  characterCount: number
  missCount: number
  durationMs: number
  firstStrokeMs?: number
  kpm?: number
  rkpm?: number
  completedAt: string
}

export interface PracticalPractice {
  id: number
  startedAt: string
}

export interface PracticalPracticeCompletion {
  id: number
  practicalPracticeId: number
  status: 'COMPLETED' | 'ABORTED'
  characterCount: number
  missCount: number
  durationMs: number
  firstStrokeMs?: number
  kpm?: number
  rkpm?: number
  completedAt: string
}

export interface PracticalWordPractice {
  id: number
  practicalPracticeId: number
  wordPracticeId: number
  wordOrder: number
}

// procedure関数で共通で使用する型
export interface ProcedureParams {
  database: DatabaseWorkerProxy
}

// Workerとの通信用インターフェース
export interface DatabaseWorkerProxy {
  executeQuery: (sql: string, params?: any[]) => Promise<unknown[]>
  seedInitialData: () => Promise<void>
}
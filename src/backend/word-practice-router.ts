import type { DatabaseWorkerProxy } from './database/database'
import { withDatabase } from './procedure-utils'

// 基本練習（個別ワード練習）用のrouter

// 基本練習開始時のパラメータ
type StartWordPracticeParams = {
  wordId: number
}

// 基本練習完了時のパラメータ
type CompleteWordPracticeParams = {
  wordPracticeId: number
  status: 'COMPLETED' | 'ABORTED'
  inputText: string
  characterCount: number
  missCount: number
  durationMs: number
  firstStrokeMs?: number
  kpm?: number
  rkpm?: number
  keystrokeTimes: Array<{ key: string; time: number; correct: boolean }>
}

// WordPracticeRecord作成
async function startWordPractice({
  database,
  input,
}: {
  database: DatabaseWorkerProxy
  input: StartWordPracticeParams
}): Promise<{ wordPracticeId: number }> {
  // 空のkeystrokeTimesでWordPracticeを作成
  await database.executeQuery('INSERT INTO WordPractice (wordId, keystrokeTimes) VALUES (?, ?)', [
    input.wordId,
    JSON.stringify([]),
  ])

  const result = await database.executeQuery(
    'SELECT * FROM WordPractice WHERE id = last_insert_rowid()'
  )

  const wordPracticeId = (result[0] as { id: number }).id
  console.log(`Started word practice: ID=${wordPracticeId}, wordId=${input.wordId}`)

  return { wordPracticeId }
}

// WordPracticeCompletion作成
async function completeWordPractice({
  database,
  input,
}: {
  database: DatabaseWorkerProxy
  input: CompleteWordPracticeParams
}): Promise<void> {
  // keystrokeTimesを更新
  await database.executeQuery('UPDATE WordPractice SET keystrokeTimes = ? WHERE id = ?', [
    JSON.stringify(input.keystrokeTimes),
    input.wordPracticeId,
  ])

  // WordPracticeCompletionを作成
  await database.executeQuery(
    `
    INSERT INTO WordPracticeCompletion (
      wordPracticeId, status, inputText, characterCount, missCount, 
      durationMs, firstStrokeMs, kpm, rkpm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      input.wordPracticeId,
      input.status,
      input.inputText,
      input.characterCount,
      input.missCount,
      input.durationMs,
      input.firstStrokeMs || null,
      input.kpm || null,
      input.rkpm || null,
    ]
  )

  console.log(`Completed word practice: ID=${input.wordPracticeId}, status=${input.status}`)
}

// 最近の練習記録を取得
async function getRecentWordPractices({ database }: { database: DatabaseWorkerProxy }): Promise<
  Array<{
    id: number
    wordId: number
    wordText: string
    wordReading: string
    startedAt: string
    status?: string
    durationMs?: number
    kpm?: number
    rkpm?: number
    missCount?: number
  }>
> {
  const result = await database.executeQuery(`
    SELECT 
      wp.id,
      wp.wordId,
      w.text as wordText,
      w.reading as wordReading,
      wp.startedAt,
      wpc.status,
      wpc.durationMs,
      wpc.kpm,
      wpc.rkpm,
      wpc.missCount
    FROM WordPractice wp
    LEFT JOIN Word w ON wp.wordId = w.id
    LEFT JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId
    ORDER BY wp.startedAt DESC
    LIMIT 20
  `)

  return result as Array<{
    id: number
    wordId: number
    wordText: string
    wordReading: string
    startedAt: string
    status?: string
    durationMs?: number
    kpm?: number
    rkpm?: number
    missCount?: number
  }>
}

// 特定ワードの練習統計を取得
async function getWordPracticeStats({
  database,
  input,
}: {
  database: DatabaseWorkerProxy
  input: { wordId: number }
}): Promise<{
  totalPractices: number
  completedPractices: number
  averageKpm?: number
  averageRkpm?: number
  averageMissCount?: number
  bestKpm?: number
  bestRkpm?: number
}> {
  const statsResult = await database.executeQuery(
    `
    SELECT 
      COUNT(wp.id) as totalPractices,
      COUNT(wpc.id) as completedPractices,
      AVG(wpc.kpm) as averageKpm,
      AVG(wpc.rkpm) as averageRkpm,
      AVG(wpc.missCount) as averageMissCount,
      MAX(wpc.kpm) as bestKpm,
      MAX(wpc.rkpm) as bestRkpm
    FROM WordPractice wp
    LEFT JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId AND wpc.status = 'COMPLETED'
    WHERE wp.wordId = ?
  `,
    [input.wordId]
  )

  const stats = statsResult[0] as {
    totalPractices: number
    completedPractices: number
    averageKpm: number | null
    averageRkpm: number | null
    averageMissCount: number | null
    bestKpm: number | null
    bestRkpm: number | null
  }
  return {
    totalPractices: stats.totalPractices || 0,
    completedPractices: stats.completedPractices || 0,
    averageKpm: stats.averageKpm || undefined,
    averageRkpm: stats.averageRkpm || undefined,
    averageMissCount: stats.averageMissCount || undefined,
    bestKpm: stats.bestKpm || undefined,
    bestRkpm: stats.bestRkpm || undefined,
  }
}

// 複数ワードの練習統計を一括取得
async function getMultipleWordStats({
  database,
  input,
}: {
  database: DatabaseWorkerProxy
  input: { wordIds: number[] }
}): Promise<
  Array<{
    wordId: number
    averageRkpm?: number
    totalPractices: number
    noMissPractices: number
  }>
> {
  if (input.wordIds.length === 0) return []

  const placeholders = input.wordIds.map(() => '?').join(',')

  const result = await database.executeQuery(
    `
    SELECT 
      wp.wordId,
      COUNT(wp.id) as totalPractices,
      AVG(CASE WHEN wpc.status = 'COMPLETED' THEN wpc.rkpm END) as averageRkpm,
      COUNT(CASE WHEN wpc.status = 'COMPLETED' AND wpc.missCount = 0 THEN 1 END) as noMissPractices
    FROM WordPractice wp
    LEFT JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId
    WHERE wp.wordId IN (${placeholders})
    GROUP BY wp.wordId
  `,
    input.wordIds
  )

  return result as Array<{
    wordId: number
    averageRkpm?: number
    totalPractices: number
    noMissPractices: number
  }>
}

// 特定ワードの練習記録を取得
async function getWordPracticeHistory({ database, input }: { database: DatabaseWorkerProxy; input: { wordId: number; limit?: number } }): Promise<Array<{
  id: number
  wordId: number
  wordText: string
  wordReading: string
  startedAt: string
  status?: string
  durationMs?: number
  kpm?: number
  rkpm?: number
  missCount?: number
}>> {
  const limit = input.limit || 50

  const result = await database.executeQuery(`
    SELECT 
      wp.id,
      wp.wordId,
      w.text as wordText,
      w.reading as wordReading,
      wp.startedAt,
      wpc.status,
      wpc.durationMs,
      wpc.kpm,
      wpc.rkpm,
      wpc.missCount
    FROM WordPractice wp
    LEFT JOIN Word w ON wp.wordId = w.id
    LEFT JOIN WordPracticeCompletion wpc ON wp.id = wpc.wordPracticeId
    WHERE wp.wordId = ?
    ORDER BY wp.startedAt DESC
    LIMIT ?
  `, [input.wordId, limit])

  return result as Array<{
    id: number
    wordId: number
    wordText: string
    wordReading: string
    startedAt: string
    status?: string
    durationMs?: number
    kpm?: number
    rkpm?: number
    missCount?: number
  }>
}

// 型安全なAPI
export const wordPracticeRouter = {
  startWordPractice: withDatabase(startWordPractice),
  completeWordPractice: withDatabase(completeWordPractice),
  getRecentWordPractices: withDatabase(getRecentWordPractices),
  getWordPracticeHistory: withDatabase(getWordPracticeHistory),
  getWordPracticeStats: withDatabase(getWordPracticeStats),
  getMultipleWordStats: withDatabase(getMultipleWordStats),
}

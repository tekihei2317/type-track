import type { Word, WordPractice, WordPracticeCompletion, ProcedureParams } from './database-models'
import { database } from './database'

// Word関連のprocedure（Worker外で実行可能）
async function getWordsByTopic({ database, input }: ProcedureParams & { input: { topicId: number } }): Promise<Word[]> {
  const result = await database.executeQuery('SELECT * FROM Word WHERE topicId = ? ORDER BY id', [input.topicId])
  return result as Word[]
}

async function getWord({ database, input }: ProcedureParams & { input: { id: number } }): Promise<Word | null> {
  const result = await database.executeQuery('SELECT * FROM Word WHERE id = ?', [input.id])
  return (result as Word[])[0] || null
}

async function createWord({ database, input }: ProcedureParams & { input: { topicId: number; text: string; reading: string } }): Promise<Word> {
  await database.executeQuery('INSERT INTO Word (topicId, text, reading) VALUES (?, ?, ?)', [input.topicId, input.text, input.reading])
  const result = await database.executeQuery('SELECT * FROM Word WHERE id = last_insert_rowid()')
  return (result as Word[])[0]
}

async function createWordPractice({ database, input }: ProcedureParams & { input: { wordId: number; keystrokeTimes: string } }): Promise<WordPractice> {
  await database.executeQuery('INSERT INTO WordPractice (wordId, keystrokeTimes) VALUES (?, ?)', [input.wordId, input.keystrokeTimes])
  const result = await database.executeQuery('SELECT * FROM WordPractice WHERE id = last_insert_rowid()')
  return (result as WordPractice[])[0]
}

async function createWordPracticeCompletion({ database, input }: ProcedureParams & {
  input: {
    wordPracticeId: number
    status: 'COMPLETED' | 'ABORTED'
    inputText: string
    characterCount: number
    missCount: number
    durationMs: number
    firstStrokeMs?: number
    kpm?: number
    rkpm?: number
  }
}): Promise<WordPracticeCompletion> {
  await database.executeQuery(
    `INSERT INTO WordPracticeCompletion 
     (wordPracticeId, status, inputText, characterCount, missCount, durationMs, firstStrokeMs, kpm, rkpm) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.wordPracticeId,
      input.status,
      input.inputText,
      input.characterCount,
      input.missCount,
      input.durationMs,
      input.firstStrokeMs,
      input.kpm,
      input.rkpm,
    ]
  )
  const result = await database.executeQuery('SELECT * FROM WordPracticeCompletion WHERE id = last_insert_rowid()')
  return (result as WordPracticeCompletion[])[0]
}

// withDatabaseはProcedure関数を、databaseパラメータを自動注入する関数に変換する
function withDatabase<TInput, TOutput>(
  procedure: (params: ProcedureParams & { input: TInput }) => Promise<TOutput>
): (input: TInput) => Promise<TOutput> {
  return async (input: TInput) => {
    return procedure({ database, input })
  }
}

// wordRouter - databaseパラメータが自動注入される
export const wordRouter = {
  getWordsByTopic: withDatabase(getWordsByTopic),
  getWord: withDatabase(getWord),
  createWord: withDatabase(createWord),
  createWordPractice: withDatabase(createWordPractice),
  createWordPracticeCompletion: withDatabase(createWordPracticeCompletion),
}
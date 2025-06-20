import type { Topic, ProcedureParams } from './database-models'
import { database } from './database'

// Topic関連のprocedure（Worker外で実行可能）
async function getTopics({ database }: ProcedureParams): Promise<Topic[]> {
  const result = await database.executeQuery('SELECT * FROM Topic ORDER BY createdAt DESC')
  return result as Topic[]
}

async function getTopic({ database, input }: ProcedureParams & { input: { id: number } }): Promise<Topic | null> {
  const result = await database.executeQuery('SELECT * FROM Topic WHERE id = ?', [input.id])
  return (result as Topic[])[0] || null
}

async function createTopic({ database, input }: ProcedureParams & { input: { name: string } }): Promise<Topic> {
  await database.executeQuery('INSERT INTO Topic (name) VALUES (?)', [input.name])
  const result = await database.executeQuery('SELECT * FROM Topic WHERE id = last_insert_rowid()')
  return (result as Topic[])[0]
}

// withDatabaseはProcedure関数を、databaseパラメータを自動注入する関数に変換する
function withDatabase<TInput, TOutput>(
  procedure: (params: ProcedureParams & { input: TInput }) => Promise<TOutput>
): (input: TInput) => Promise<TOutput>
function withDatabase<TOutput>(
  procedure: (params: ProcedureParams) => Promise<TOutput>
): () => Promise<TOutput>
function withDatabase<TInput, TOutput>(
  procedure: (params: ProcedureParams & { input?: TInput }) => Promise<TOutput>
): (input?: TInput) => Promise<TOutput> {
  return async (input?: TInput) => {
    if (input !== undefined) {
      return procedure({ database, input })
    } else {
      return procedure({ database })
    }
  }
}

// topicRouter - databaseパラメータが自動注入される
export const topicRouter = {
  getTopics: withDatabase(getTopics),
  getTopic: withDatabase(getTopic),
  createTopic: withDatabase(createTopic),
}
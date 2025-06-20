import type { Topic } from './database/database-models'
import { type ProcedureParams, withDatabase } from './procedure-utils'

// Topic関連のprocedure（Worker外で実行可能）
async function getTopics({ database }: ProcedureParams): Promise<Topic[]> {
  const result = await database.executeQuery('SELECT * FROM Topic ORDER BY createdAt DESC')
  return result as Topic[]
}

async function getTopic({
  database,
  input,
}: ProcedureParams & { input: { id: number } }): Promise<Topic | null> {
  const result = await database.executeQuery('SELECT * FROM Topic WHERE id = ?', [input.id])
  return (result as Topic[])[0] || null
}

async function createTopic({
  database,
  input,
}: ProcedureParams & { input: { name: string } }): Promise<Topic> {
  await database.executeQuery('INSERT INTO Topic (name) VALUES (?)', [input.name])
  const result = await database.executeQuery('SELECT * FROM Topic WHERE id = last_insert_rowid()')
  return (result as Topic[])[0]
}

// topicRouter - databaseパラメータが自動注入される
export const topicRouter = {
  getTopics: withDatabase(getTopics),
  getTopic: withDatabase(getTopic),
  createTopic: withDatabase(createTopic),
}

import { database, type DatabaseWorkerProxy } from './database/database'

// procedure関数で共通で使用する型
export interface ProcedureParams {
  database: DatabaseWorkerProxy
}

// Conditional Typesで、procedureの型からinputの有無を判定
// inputプロパティが存在するかどうかを正確にチェック
type HasInput<T> = T extends { input: unknown } ? true : false

type InferProcedureResult<T> = T extends (params: infer TParams) => Promise<infer TOutput>
  ? HasInput<TParams> extends true
    ? TParams extends { input: infer TInput }
      ? (input: TInput) => Promise<TOutput>
      : never
    : () => Promise<TOutput>
  : never

export function withDatabase<T>(procedure: T): InferProcedureResult<T> {
  return ((...args: unknown[]) => {
    if (args.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (procedure as any)({ database, input: args[0] })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (procedure as any)({ database })
    }
  }) as InferProcedureResult<T>
}

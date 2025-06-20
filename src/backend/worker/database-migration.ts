import sqlite3InitModule from '@sqlite.org/sqlite-wasm'
import type { Database } from '@sqlite.org/sqlite-wasm'

// マイグレーションファイルのインポート
import migrationSQL from '../../../prisma/migrations/20250620072129_init/migration.sql?raw'

// マイグレーション管理
export async function runMigration(
  database: Database,
  migrationName: string,
  migrationSQL: string
): Promise<void> {
  // 既に実行済みかチェック
  const existingMigration = database.exec('SELECT name FROM _migrations WHERE name = ?', {
    bind: [migrationName],
    returnValue: 'resultRows',
    rowMode: 'object',
  })

  if (existingMigration.length > 0) {
    console.log(`Migration ${migrationName} already executed, skipping`)
    return
  }

  console.log(`Running migration: ${migrationName}`)

  // マイグレーション実行
  database.exec(migrationSQL)

  // 実行記録を保存
  database.exec('INSERT INTO _migrations (name) VALUES (?)', {
    bind: [migrationName],
  })

  console.log(`Migration ${migrationName} completed`)
}

export async function resetDatabase(currentDb: Database | null): Promise<Database> {
  console.log('Resetting database...')

  const sqlite3 = await sqlite3InitModule()
  let db: Database

  if ('opfs' in sqlite3) {
    // OPFSの場合、データベースファイルを削除
    if (currentDb) {
      currentDb.close()
    }

    try {
      // OPFSのファイルシステムにアクセスしてファイルを削除
      const opfsRoot = await navigator.storage.getDirectory()
      await opfsRoot.removeEntry('type-track.db')
      console.log('OPFS database file deleted')
    } catch (error) {
      console.log('Database file not found or already deleted:', error)
    }

    // 新しいデータベースを作成
    db = new sqlite3.oo1.OpfsDb('/type-track.db')
    console.log('New OPFS database created')
  } else {
    // メモリDBの場合、新しいインスタンスを作成
    if (currentDb) {
      currentDb.close()
    }
    db = new sqlite3.oo1.DB()
    console.log('New memory database created')
  }

  // マイグレーション管理テーブルを作成
  createMigrationTable(db)

  // マイグレーションを実行
  await runMigrations(db)

  // シードデータも実行
  await seedInitialData(db)

  console.log('Database reset completed')
  return db
}

export async function runMigrations(database: Database): Promise<void> {
  console.log('Running pending migrations...')

  // 利用可能なマイグレーションを実行
  await runMigration(database, '20250620072129_init', migrationSQL)

  console.log('All migrations completed')
}

export function createMigrationTable(database: Database): void {
  // マイグレーション管理テーブルを最初に作成（存在しない場合）
  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS "_migrations" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL UNIQUE,
        "executed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Migration management table created')
  } catch (error) {
    console.error('Failed to create migrations table:', error)
  }
}

// 初期データの投入
export async function seedInitialData(database: Database): Promise<void> {
  // 既にデータがある場合はスキップ
  const existingTopics = database.exec('SELECT COUNT(*) as count FROM Topic', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })

  if ((existingTopics[0] as unknown as { count: number }).count > 0) {
    console.log('Initial data already exists, skipping seed')
    return
  }

  console.log('Seeding initial data...')

  // XMLファイルからワードをインポート
  try {
    const { importMultipleXmlFiles } = await import('./seed')

    // public/wordsディレクトリの既知のファイルをインポート
    const xmlFiles = ['1258_給食のおかず.xml', '1259_梅雨の言葉.xml', '1260_元気が出る言葉.xml']

    console.log('Importing XML files...')
    const result = await importMultipleXmlFiles(database, xmlFiles)
    console.log(
      `Imported ${result.totalTopics} topics with ${result.totalWords} words from XML files`
    )
  } catch (error) {
    console.error('Failed to import XML files:', error)

    // XMLインポートに失敗した場合、サンプルデータを作成
    console.log('Falling back to sample data...')

    // サンプルお題の作成
    database.exec(`
      INSERT INTO Topic (name) VALUES
        ('元気が出る言葉'),
        ('基本練習')
    `)

    // サンプルワードの作成
    database.exec(`
      INSERT INTO Word (topicId, text, reading) VALUES
        (1, '案外できるものだよ', 'あんがいできるものだよ'),
        (1, '大丈夫、きっとうまくいく', 'だいじょうぶ、きっとうまくいく'),
        (2, 'hello world', 'hello world'),
        (2, 'programming', 'programming')
    `)
  }

  console.log('Initial data seeded successfully')
}

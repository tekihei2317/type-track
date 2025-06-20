import type { Database } from '@sqlite.org/sqlite-wasm'

// Worker環境用の簡単なXMLパーサー
function parseXmlInWorker(xmlContent: string) {
  // 名前を抽出
  const nameMatch = xmlContent.match(/<Name>(.*?)<\/Name>/s)
  const name = nameMatch ? nameMatch[1].trim() : 'Unknown Topic'

  // Word要素全体を抽出してから、その中のDisplayとCharactersを処理
  const wordMatches = Array.from(xmlContent.matchAll(/<Word>(.*?)<\/Word>/gs))

  const words = []

  for (const wordMatch of wordMatches) {
    const wordContent = wordMatch[1]
    const displayMatch = wordContent.match(/<Display>(.*?)<\/Display>/s)
    const charactersMatch = wordContent.match(/<Characters>(.*?)<\/Characters>/s)

    if (displayMatch && charactersMatch) {
      words.push({
        display: displayMatch[1].trim(),
        characters: charactersMatch[1].trim(),
      })
    }
  }

  console.log(`Parsed ${words.length} words from XML`)
  console.log('First few words:', words.slice(0, 3))

  return {
    name,
    words,
  }
}

// XMLファイルからワードをインポート
export async function importWordsFromXml(
  database: Database,
  xmlContent: string
): Promise<{ topicId: number; wordCount: number }> {
  // Worker環境用のパーサーを使用
  const eTypingTopic = parseXmlInWorker(xmlContent)

  // お題を作成
  database.exec('INSERT INTO Topic (name) VALUES (?)', {
    bind: [eTypingTopic.name],
  })

  const topicResult = database.exec('SELECT * FROM Topic WHERE id = last_insert_rowid()', {
    returnValue: 'resultRows',
    rowMode: 'object',
  })

  const topicId = (topicResult[0] as { id: number }).id

  // ワードをデータベースに挿入
  let wordCount = 0
  eTypingTopic.words.forEach(word => {
    database.exec('INSERT INTO Word (topicId, text, reading) VALUES (?, ?, ?)', {
      bind: [topicId, word.display, word.characters],
    })
    wordCount++
  })

  console.log(`Imported topic "${eTypingTopic.name}" with ${wordCount} words`)
  return { topicId, wordCount }
}

// XMLファイルの内容を取得
export async function fetchXmlFile(filename: string): Promise<string> {
  const response = await fetch(`/words/${filename}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}`)
  }
  return response.text()
}

// 複数のXMLファイルを一括インポート
export async function importMultipleXmlFiles(
  database: Database,
  filenames: string[]
): Promise<{ totalTopics: number; totalWords: number }> {
  let totalTopics = 0
  let totalWords = 0

  for (const filename of filenames) {
    try {
      console.log(`Importing ${filename}...`)
      const xmlContent = await fetchXmlFile(filename)
      const result = await importWordsFromXml(database, xmlContent)
      totalTopics++
      totalWords += result.wordCount
    } catch (error) {
      console.error(`Failed to import ${filename}:`, error)
    }
  }

  console.log(`Import completed: ${totalTopics} topics, ${totalWords} words`)
  return { totalTopics, totalWords }
}

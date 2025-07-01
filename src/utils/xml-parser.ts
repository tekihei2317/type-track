import type { Topic, Word } from '../types'

export type ETypingWord = {
  display: string
  characters: string
}

export type ETypingTopic = {
  name: string
  author: string
  signature: string
  memo: string
  words: ETypingWord[]
}

export function parseXmlToTopic(xmlText: string): ETypingTopic {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('XML parsing failed: ' + parserError.textContent)
  }

  const wordsElement = xmlDoc.querySelector('Words')
  if (!wordsElement) {
    throw new Error('Invalid XML format: Words element not found')
  }

  const name = wordsElement.querySelector('Name')?.textContent || 'Unknown Topic'
  const author = wordsElement.querySelector('Author')?.textContent || ''
  const signature = wordsElement.querySelector('Signature')?.textContent || ''
  const memo = wordsElement.querySelector('Memo')?.textContent || ''

  const wordElements = xmlDoc.querySelectorAll('Word')
  const words: ETypingWord[] = []

  wordElements.forEach(wordElement => {
    const display = wordElement.querySelector('Display')?.textContent
    const characters = wordElement.querySelector('Characters')?.textContent

    if (display && characters) {
      words.push({
        display: display.trim(),
        characters: characters.trim(),
      })
    }
  })

  return {
    name,
    author,
    signature,
    memo,
    words,
  }
}

export function convertETypingTopicToAppData(
  eTypingTopic: ETypingTopic,
  topicId: number
): { topic: Topic; words: Word[] } {
  const topic: Topic = {
    id: topicId,
    name: eTypingTopic.name,
  }

  const words: Word[] = eTypingTopic.words.map((word, index) => ({
    id: topicId * 1000 + index + 1, // Simple ID generation
    topicId: topicId,
    text: word.display,
    reading: word.characters,
  }))

  return { topic, words }
}

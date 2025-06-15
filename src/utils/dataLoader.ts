import type { Topic, Word } from '../types'
import { parseXmlToTopic, convertETypingTopicToAppData } from './xmlParser'

export async function loadXmlFile(path: string): Promise<string> {
  try {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Failed to load XML file: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    console.error('Error loading XML file:', error)
    throw error
  }
}

export async function loadETypingTopic(xmlPath: string, topicId: number): Promise<{ topic: Topic; words: Word[] }> {
  try {
    const xmlText = await loadXmlFile(xmlPath)
    const eTypingTopic = parseXmlToTopic(xmlText)
    return convertETypingTopicToAppData(eTypingTopic, topicId)
  } catch (error) {
    console.error('Error loading e-typing topic:', error)
    throw error
  }
}

export async function loadAllETypingTopics(): Promise<{ topics: Topic[]; words: Word[] }> {
  const xmlFiles = [
    { path: '/words/1260_元気が出る言葉.xml', id: 1260 },
    { path: '/words/1258_給食のおかず.xml', id: 1258 },
    { path: '/words/1259_梅雨の言葉.xml', id: 1259 },
  ]
  
  const allTopics: Topic[] = []
  const allWords: Word[] = []
  
  for (const file of xmlFiles) {
    try {
      const { topic, words } = await loadETypingTopic(file.path, file.id)
      allTopics.push(topic)
      allWords.push(...words)
    } catch (error) {
      console.error(`Failed to load ${file.path}:`, error)
    }
  }
  
  return { topics: allTopics, words: allWords }
}
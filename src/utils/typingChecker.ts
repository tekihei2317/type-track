import { searchEntry, searchEntriesByPrefix, createExpectedInput } from './romanTable'

export type CheckResult = {
  correct: boolean
  completed: boolean
  currentChar?: string
  nextChar?: string
}

export type TypingChecker = {
  word: string
  expectedInput: string
  currentInput: string
  completed: boolean
  buffer: string
  wordIndex: number
  inputChar: (char: string) => CheckResult
  reset: () => void
  getCurrentState: () => {
    word: string
    typedPart: string
    currentChar: string
    remainingPart: string
  }
}

export function createTypingChecker(word: string): TypingChecker {
  let buffer = ''
  let wordIndex = 0
  let completed = false
  let currentInput = ''
  const expectedInput = createExpectedInput(word)

  const checker: TypingChecker = {
    word,
    expectedInput,
    currentInput,
    completed,
    buffer,
    wordIndex,

    inputChar(char: string): CheckResult {
      if (completed) {
        return { correct: false, completed: true }
      }

      const newBuffer = buffer + char
      
      // 完全一致する変換ルールを検索
      const exactEntry = searchEntry(newBuffer)
      
      // プレフィックス一致する変換ルールを検索
      const prefixEntries = searchEntriesByPrefix(newBuffer)

      if (exactEntry) {
        // 完全一致した場合
        const expectedOutput = word.slice(wordIndex, wordIndex + exactEntry.output.length)
        
        if (exactEntry.output === expectedOutput) {
          // 正しい入力
          wordIndex += exactEntry.output.length
          currentInput += char
          buffer = exactEntry.nextInput || ''
          
          // 単語が完了したかチェック
          if (wordIndex >= word.length) {
            completed = true
            return { correct: true, completed: true }
          }
          
          return { correct: true, completed: false }
        } else {
          // 間違った入力
          return { correct: false, completed: false }
        }
      } else if (prefixEntries.length > 0) {
        // プレフィックス一致がある場合（継続可能）
        // 複数の候補がある場合、最適な候補を選択
        const validEntries = prefixEntries.filter(entry => {
          const expectedOutput = word.slice(wordIndex, wordIndex + entry.output.length)
          return entry.output === expectedOutput
        })
        
        if (validEntries.length > 0) {
          // 継続可能な入力
          buffer = newBuffer
          currentInput += char
          return { correct: true, completed: false }
        } else {
          // 無効な入力
          return { correct: false, completed: false }
        }
      } else {
        // マッチする変換ルールがない
        return { correct: false, completed: false }
      }
    },

    reset() {
      buffer = ''
      wordIndex = 0
      completed = false
      currentInput = ''
    },

    getCurrentState() {
      const typedPart = word.slice(0, wordIndex)
      const currentChar = wordIndex < word.length ? word[wordIndex] : ''
      const remainingPart = word.slice(wordIndex + 1)
      
      return {
        word,
        typedPart,
        currentChar,
        remainingPart
      }
    }
  }

  return checker
}
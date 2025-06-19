import {
  checkRightCorrect,
  convertRoman,
  createExpectedInput,
  searchEntriesByPrefix,
  searchEntry,
} from './romanTable'

export type CheckResult = {
  correct: boolean
}

export type Checker = {
  expected: string
  currentRoman: string
  currentKana: string

  /**
   * 文字が正しい入力であればセットする
   */
  setCharacter: (character: string) => CheckResult
}

export function initializeChecker({ word }: { word: string }): Checker {
  let buffer = ''
  let expected = createExpectedInput(word)
  let wordIndex = 0
  let currentKana = ''
  let currentRoman = ''

  const checker: Checker = {
    get expected(): string {
      return expected
    },
    get currentRoman(): string {
      return currentRoman
    },
    get currentKana(): string {
      return currentKana
    },

    setCharacter(character): CheckResult {
      // 変換できる場合→変換後の文字が、ワードに合致していればOK
      // 変換できない場合→今後、ワードに一致させられる場合はOK
      // 消極的に変換する場合→左側の変換後がワードの現在位置に一致していて、かつ右側がワードに一致させられる場合はOK

      const tempBuffer = buffer + character

      const entry = searchEntry(tempBuffer)
      const prefixEntries = searchEntriesByPrefix(tempBuffer)

      if (prefixEntries.length >= 2) {
        // 変換できない場合
        const entry = prefixEntries.find(entry => {
          const isOutputCorrect =
            entry.output === word.slice(wordIndex, wordIndex + entry.output.length)

          let isNextInputCorrect = true
          if (entry.nextInput) {
            const index = wordIndex + entry.output.length
            isNextInputCorrect = searchEntriesByPrefix(entry.nextInput).some(
              e => e.output === word.slice(index, index + e.output.length)
            )
          }

          return isOutputCorrect && isNextInputCorrect
        })

        if (entry !== undefined) {
          // characterは正解
          buffer = tempBuffer
          currentRoman += character

          // expectedを更新する
          if (character === expected[0]) {
            expected = expected.slice(1)
          } else {
            expected = createExpectedInput(word.slice(wordIndex), buffer)
          }

          return { correct: true }
        } else {
          return { correct: false }
        }
      } else {
        if (entry) {
          // 変換ルールがある場合は、変換後の文字列がワードに一致させられるならばOK
          // TODO: entry.nextInputに関する処理
          if (entry.output === word.slice(wordIndex, wordIndex + entry.output.length)) {
            buffer = entry.nextInput ? entry.nextInput : ''
            currentRoman += character
            currentKana += entry.output
            wordIndex += entry.output.length

            if (expected[0] === character) {
              // 候補と同じ文字を入力した場合は、候補をそのまま使う
              expected = expected.slice(1)
            } else {
              // ローマ字入力の場合は、ここでnextInputを考慮しなくてOK？
              // ローマ字の候補と違う場合は、ワードの残りに対する候補を再作成する
              expected = createExpectedInput(word.slice(wordIndex))
            }

            return { correct: true }
          } else {
            return { correct: false }
          }
        } else if (prefixEntries.length === 0) {
          // bufferが今後変換されることはない場合
          // |buffer|-1文字と、1文字に分けて処理する

          const left = tempBuffer.slice(0, tempBuffer.length - 1)
          const right = tempBuffer.slice(tempBuffer.length - 1)

          const leftConverted = convertRoman(left)
          const isLeftCorrect =
            leftConverted === word.slice(wordIndex, wordIndex + leftConverted.length)
          const isRightCorrect = checkRightCorrect(right, word, wordIndex + leftConverted.length)

          if (isLeftCorrect && isRightCorrect) {
            buffer = right
            currentRoman += character
            currentKana += leftConverted
            wordIndex += leftConverted.length

            // expectedを更新する
            expected = createExpectedInput(word.slice(wordIndex), right)
            return { correct: true }
          } else {
            return { correct: false }
          }
        }
      }

      return { correct: true }
    },
  }

  return checker
}

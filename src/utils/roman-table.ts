import type { TableEntry } from './romantable-type'
import { defaultRomanTable } from './romantable-default'

// const romanTable = tukiRomanTableForRoman;
const romanTable = defaultRomanTable

/**
 * 文字列に該当するルールを検索する
 */
export function searchEntry(text: string): TableEntry | undefined {
  return romanTable.find(entry => entry.input === text)
}

/**
 * ローマ字を変換する
 */
export function convertRoman(text: string): string {
  const rule = searchEntry(text)
  if (rule === undefined) return text
  return rule.output
}

/**
 * entry.inputがprefixで始まるものを検索する
 */
export function searchEntriesByPrefix(prefix: string): TableEntry[] {
  return romanTable.filter(entry => entry.input.startsWith(prefix))
}

/**
 * ローマ字の文字列を、ひらがなに変換する
 */
export function convert(roman: string): string {
  let hiragana = ''
  let buffer = ''
  for (let i = 0; i < roman.length; i++) {
    buffer += roman[i]

    const result = convertBuffer(buffer)
    hiragana += result.output
    buffer = result.buffer
  }
  return hiragana
}

export function convertBuffer(buffer: string): {
  buffer: string
  output: string
} {
  const entry = searchEntry(buffer)
  const prefixEntries = searchEntriesByPrefix(buffer)

  if (prefixEntries.length >= 2) {
    // バッファに対する（将来的なものも含む）変換候補が複数ある場合は、変換を保留する
    // 例: buffer=nのとき、nかnnかnaか分からないので保留する
    return { buffer, output: '' }
  } else {
    if (entry) {
      // 変換ルールが1つしかない場合、そのルールを使って変換する
      return {
        output: entry.output,
        buffer: entry.nextInput ? entry.nextInput : '',
      }
    } else {
      // 変換ルールがない場合、バッファはこれから変換される可能性はないので、区切って変換を完了させる
      // |buffer|-1文字と、1文字の2つに分けて変換すればいいっぽい

      const left = buffer.slice(0, buffer.length - 1)
      const right = buffer.slice(buffer.length - 1)

      // 左半分を変換する。本当は右半分も変換して、変換できなかった場合はバッファに入れる必要がある。
      // ここで変換していないのは、ローマ字には1文字で変換されるものがaiueoしかなく、
      // アルファベットの入力のみであれば他の文字+aiueoは全てルールに従って変換されるため。
      // 例えば記号も入力する場合は、";a"などを";あ"に変換する必要があるので、ここで変換が必要。
      // 他にも、例えば"na"→"な"というルールがなければ、"na"をここで"んあ"に変換する必要がある。
      return { output: convertRoman(left), buffer: right }
    }
  }
}

/**
 * ワードに対して、予想されるローマ字の文字列を作成する
 */
export function createExpectedInput(
  word: string,
  initialBuffer: string | undefined = undefined
): string {
  // 文字列を前から順番に見ていって、最長一致するものを選択していく

  let index = 0
  let buffer = initialBuffer
  let expected = ''

  while (index < word.length) {
    let candidate: TableEntry | undefined

    romanTable.forEach(entry => {
      // バッファと一致しているかどうか
      const matchBuffer = buffer ? entry.input.startsWith(buffer) : true

      const isOutputCorrect = entry.output === word.slice(index, index + entry.output.length)
      let isNextInputCorrect = true
      if (entry.nextInput) {
        const nextKanaIndex = index + entry.output.length
        isNextInputCorrect = searchEntriesByPrefix(entry.nextInput).some(
          e => e.output === word.slice(nextKanaIndex, nextKanaIndex + e.output.length)
        )
      }

      if (matchBuffer && isOutputCorrect && isNextInputCorrect) {
        // 最長一致の中で、最初に一致したものを選択する
        if (candidate === undefined || entry.output.length > candidate.output.length) {
          candidate = entry
        }
      }
    })

    // 変換ルールが存在しなかった場合（記号などがある場合は実装が必要）
    if (!candidate) {
      throw new Error(`${word.slice(index)} を変換できません`)
    }

    index += candidate.output.length

    // 月配列で文字の区切りがわかるように、空白を挿入しておく
    // if (expected !== "") expected += " ";

    expected += candidate.input.slice(buffer ? buffer.length : 0)
    buffer = candidate.nextInput ? candidate.nextInput : undefined
  }

  return expected
}

/**
 * TODO:
 */
export function checkRightCorrect(right: string, word: string, index: number) {
  return romanTable
    .filter(entry => {
      return entry.input.startsWith(right)
    })
    .some(entry => entry.output === word.slice(index, index + entry.output.length))
}

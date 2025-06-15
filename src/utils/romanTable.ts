export type RomanEntry = {
  input: string
  output: string
  nextInput?: string
}

// ローマ字変換テーブル
export const romanTable: RomanEntry[] = [
  // 基本的な五十音
  { input: 'a', output: 'あ' },
  { input: 'i', output: 'い' },
  { input: 'u', output: 'う' },
  { input: 'e', output: 'え' },
  { input: 'o', output: 'お' },

  { input: 'ka', output: 'か' },
  { input: 'ki', output: 'き' },
  { input: 'ku', output: 'く' },
  { input: 'ke', output: 'け' },
  { input: 'ko', output: 'こ' },

  { input: 'sa', output: 'さ' },
  { input: 'si', output: 'し' },
  { input: 'shi', output: 'し' },
  { input: 'su', output: 'す' },
  { input: 'se', output: 'せ' },
  { input: 'so', output: 'そ' },

  { input: 'ta', output: 'た' },
  { input: 'ti', output: 'ち' },
  { input: 'chi', output: 'ち' },
  { input: 'tu', output: 'つ' },
  { input: 'tsu', output: 'つ' },
  { input: 'te', output: 'て' },
  { input: 'to', output: 'と' },

  { input: 'na', output: 'な' },
  { input: 'ni', output: 'に' },
  { input: 'nu', output: 'ぬ' },
  { input: 'ne', output: 'ね' },
  { input: 'no', output: 'の' },

  { input: 'ha', output: 'は' },
  { input: 'hi', output: 'ひ' },
  { input: 'hu', output: 'ふ' },
  { input: 'fu', output: 'ふ' },
  { input: 'he', output: 'へ' },
  { input: 'ho', output: 'ほ' },

  { input: 'ma', output: 'ま' },
  { input: 'mi', output: 'み' },
  { input: 'mu', output: 'む' },
  { input: 'me', output: 'め' },
  { input: 'mo', output: 'も' },

  { input: 'ya', output: 'や' },
  { input: 'yu', output: 'ゆ' },
  { input: 'yo', output: 'よ' },

  { input: 'ra', output: 'ら' },
  { input: 'ri', output: 'り' },
  { input: 'ru', output: 'る' },
  { input: 're', output: 'れ' },
  { input: 'ro', output: 'ろ' },

  { input: 'wa', output: 'わ' },
  { input: 'wo', output: 'を' },
  { input: 'n', output: 'ん' },

  // 濁音
  { input: 'ga', output: 'が' },
  { input: 'gi', output: 'ぎ' },
  { input: 'gu', output: 'ぐ' },
  { input: 'ge', output: 'げ' },
  { input: 'go', output: 'ご' },

  { input: 'za', output: 'ざ' },
  { input: 'zi', output: 'じ' },
  { input: 'ji', output: 'じ' },
  { input: 'zu', output: 'ず' },
  { input: 'ze', output: 'ぜ' },
  { input: 'zo', output: 'ぞ' },

  { input: 'da', output: 'だ' },
  { input: 'di', output: 'ぢ' },
  { input: 'du', output: 'づ' },
  { input: 'de', output: 'で' },
  { input: 'do', output: 'ど' },

  { input: 'ba', output: 'ば' },
  { input: 'bi', output: 'び' },
  { input: 'bu', output: 'ぶ' },
  { input: 'be', output: 'べ' },
  { input: 'bo', output: 'ぼ' },

  // 半濁音
  { input: 'pa', output: 'ぱ' },
  { input: 'pi', output: 'ぴ' },
  { input: 'pu', output: 'ぷ' },
  { input: 'pe', output: 'ぺ' },
  { input: 'po', output: 'ぽ' },

  // 拗音
  { input: 'kya', output: 'きゃ' },
  { input: 'kyi', output: 'きぃ' },
  { input: 'kyu', output: 'きゅ' },
  { input: 'kye', output: 'きぇ' },
  { input: 'kyo', output: 'きょ' },

  { input: 'sha', output: 'しゃ' },
  { input: 'sya', output: 'しゃ' },
  { input: 'shi', output: 'し' },
  { input: 'syi', output: 'しぃ' },
  { input: 'shu', output: 'しゅ' },
  { input: 'syu', output: 'しゅ' },
  { input: 'she', output: 'しぇ' },
  { input: 'sye', output: 'しぇ' },
  { input: 'sho', output: 'しょ' },
  { input: 'syo', output: 'しょ' },

  { input: 'cha', output: 'ちゃ' },
  { input: 'tya', output: 'ちゃ' },
  { input: 'chi', output: 'ち' },
  { input: 'tyi', output: 'ちぃ' },
  { input: 'chu', output: 'ちゅ' },
  { input: 'tyu', output: 'ちゅ' },
  { input: 'che', output: 'ちぇ' },
  { input: 'tye', output: 'ちぇ' },
  { input: 'cho', output: 'ちょ' },
  { input: 'tyo', output: 'ちょ' },

  { input: 'nya', output: 'にゃ' },
  { input: 'nyi', output: 'にぃ' },
  { input: 'nyu', output: 'にゅ' },
  { input: 'nye', output: 'にぇ' },
  { input: 'nyo', output: 'にょ' },

  { input: 'hya', output: 'ひゃ' },
  { input: 'hyi', output: 'ひぃ' },
  { input: 'hyu', output: 'ひゅ' },
  { input: 'hye', output: 'ひぇ' },
  { input: 'hyo', output: 'ひょ' },

  { input: 'mya', output: 'みゃ' },
  { input: 'myi', output: 'みぃ' },
  { input: 'myu', output: 'みゅ' },
  { input: 'mye', output: 'みぇ' },
  { input: 'myo', output: 'みょ' },

  { input: 'rya', output: 'りゃ' },
  { input: 'ryi', output: 'りぃ' },
  { input: 'ryu', output: 'りゅ' },
  { input: 'rye', output: 'りぇ' },
  { input: 'ryo', output: 'りょ' },

  // 濁音の拗音
  { input: 'gya', output: 'ぎゃ' },
  { input: 'gyi', output: 'ぎぃ' },
  { input: 'gyu', output: 'ぎゅ' },
  { input: 'gye', output: 'ぎぇ' },
  { input: 'gyo', output: 'ぎょ' },

  { input: 'ja', output: 'じゃ' },
  { input: 'jya', output: 'じゃ' },
  { input: 'zya', output: 'じゃ' },
  { input: 'ji', output: 'じ' },
  { input: 'jyi', output: 'じぃ' },
  { input: 'zyi', output: 'じぃ' },
  { input: 'ju', output: 'じゅ' },
  { input: 'jyu', output: 'じゅ' },
  { input: 'zyu', output: 'じゅ' },
  { input: 'je', output: 'じぇ' },
  { input: 'jye', output: 'じぇ' },
  { input: 'zye', output: 'じぇ' },
  { input: 'jo', output: 'じょ' },
  { input: 'jyo', output: 'じょ' },
  { input: 'zyo', output: 'じょ' },

  { input: 'bya', output: 'びゃ' },
  { input: 'byi', output: 'びぃ' },
  { input: 'byu', output: 'びゅ' },
  { input: 'bye', output: 'びぇ' },
  { input: 'byo', output: 'びょ' },

  // 半濁音の拗音
  { input: 'pya', output: 'ぴゃ' },
  { input: 'pyi', output: 'ぴぃ' },
  { input: 'pyu', output: 'ぴゅ' },
  { input: 'pye', output: 'ぴぇ' },
  { input: 'pyo', output: 'ぴょ' },

  // 促音（っ）のパターン
  { input: 'kk', output: 'っ', nextInput: 'k' },
  { input: 'ss', output: 'っ', nextInput: 's' },
  { input: 'tt', output: 'っ', nextInput: 't' },
  { input: 'pp', output: 'っ', nextInput: 'p' },
  { input: 'cc', output: 'っ', nextInput: 'c' },
  { input: 'gg', output: 'っ', nextInput: 'g' },
  { input: 'zz', output: 'っ', nextInput: 'z' },
  { input: 'jj', output: 'っ', nextInput: 'j' },
  { input: 'dd', output: 'っ', nextInput: 'd' },
  { input: 'bb', output: 'っ', nextInput: 'b' },
  { input: 'ff', output: 'っ', nextInput: 'f' },
  { input: 'hh', output: 'っ', nextInput: 'h' },
  { input: 'mm', output: 'っ', nextInput: 'm' },
  { input: 'rr', output: 'っ', nextInput: 'r' },
  { input: 'ww', output: 'っ', nextInput: 'w' },
  { input: 'yy', output: 'っ', nextInput: 'y' },

  // 数字
  { input: '1', output: '１' },
  { input: '2', output: '２' },
  { input: '3', output: '３' },
  { input: '4', output: '４' },
  { input: '5', output: '５' },
  { input: '6', output: '６' },
  { input: '7', output: '７' },
  { input: '8', output: '８' },
  { input: '9', output: '９' },
  { input: '0', output: '０' },

  // 記号
  { input: '-', output: 'ー' },
  { input: '.', output: '。' },
  { input: ',', output: '、' },
  { input: '?', output: '？' },
  { input: '!', output: '！' },
]

export function searchEntry(input: string): RomanEntry | undefined {
  return romanTable.find(entry => entry.input === input)
}

export function searchEntriesByPrefix(prefix: string): RomanEntry[] {
  return romanTable.filter(entry => entry.input.startsWith(prefix))
}

export function createExpectedInput(word: string): string {
  // 単純化：ひらがなからローマ字への変換
  // 実際のタイピングゲームでは、より複雑な処理が必要
  let result = ''
  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const entry = romanTable.find(e => e.output === char)
    if (entry) {
      result += entry.input
    } else {
      result += char // そのまま追加（英数字など）
    }
  }
  return result
}

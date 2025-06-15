import type { KeystrokeData } from '../hooks/useKeystrokes'

type KeystrokeBarChartProps = {
  keystrokeData: KeystrokeData
  height?: number
}

export function KeystrokeBarChart({ keystrokeData, height = 200 }: KeystrokeBarChartProps) {
  const { strokes, expectedRoman } = keystrokeData

  // 時間を速度（1秒あたりの文字数）に変換
  const speeds = strokes.map(s => 1000 / s.time) // 1000ms / time = 文字/秒
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 1
  const minSpeed = speeds.length > 0 ? Math.min(...speeds) : 0
  const speedRange = maxSpeed - minSpeed || 1

  // 棒の幅を固定
  const totalExpectedChars = expectedRoman.length + strokes.length
  const barWidth = 30 // 固定幅

  // 全体のコンテナ幅を計算（入力完了時の幅で固定）
  const totalWidth = totalExpectedChars * barWidth

  return (
    <div className="w-full">
      <div className="text-xs text-gray-600 mb-2">打鍵速度 (文字/秒)</div>
      <div className="flex justify-center">
        <div
          className="flex items-end justify-start"
          style={{
            height,
            width: totalWidth,
            minWidth: totalWidth,
          }}
        >
          {/* 入力済みの棒グラフ */}
          {strokes.map((stroke, index) => {
            const speed = speeds[index]
            const normalizedHeight = ((speed - minSpeed) / speedRange) * (height - 60) + 40

            return (
              <div
                key={index}
                className="bg-blue-400 flex items-start justify-center text-white text-xs font-mono relative"
                style={{
                  height: normalizedHeight,
                  width: barWidth,
                  minWidth: barWidth,
                }}
              >
                <span className="absolute top-2 origin-center">{stroke.key}</span>
              </div>
            )
          })}

          {/* 未入力部分の空白スペース */}
          {expectedRoman.length > 0 && (
            <div
              style={{
                height: 1, // 見えない高さ
                width: expectedRoman.length * barWidth,
                minWidth: expectedRoman.length * barWidth,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

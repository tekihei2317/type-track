import type { KeystrokeData } from '../hooks/useKeystrokes'

type KpmLineChartProps = {
  keystrokeData: KeystrokeData
  height?: number
}

export function KpmLineChart({ keystrokeData, height = 100 }: KpmLineChartProps) {
  const { strokes } = keystrokeData

  if (strokes.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-gray-400 text-sm">KPMは2文字以上入力後に表示されます</span>
      </div>
    )
  }

  // 各時点でのKPMを計算
  const kpmData: { index: number; kpm: number; key: string }[] = []
  let cumulativeTime = 0

  for (let i = 0; i < strokes.length; i++) {
    cumulativeTime += strokes[i].time
    if (i > 0) {
      // その時点までの文字数 / 経過時間（分）
      const charactersTyped = i + 1
      const elapsedMinutes = cumulativeTime / (1000 * 60)
      const kpm = Math.round(charactersTyped / elapsedMinutes)
      kpmData.push({
        index: i,
        kpm,
        key: strokes[i].key,
      })
    }
  }

  if (kpmData.length === 0) return null

  const maxKpm = Math.max(...kpmData.map(d => d.kpm))
  const minKpm = Math.min(...kpmData.map(d => d.kpm))
  const kpmRange = maxKpm - minKpm || 1

  const svgWidth = Math.max(400, kpmData.length * 20)
  const svgHeight = height - 40
  const padding = 20

  // SVGパス用の座標を計算
  const points = kpmData.map((data, index) => {
    const x = padding + (index / (kpmData.length - 1)) * (svgWidth - 2 * padding)
    const y = padding + ((maxKpm - data.kpm) / kpmRange) * (svgHeight - 2 * padding)
    return { x, y, ...data }
  })

  const pathData = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  return (
    <div className="w-full">
      <div className="text-xs text-gray-600 mb-2">KPM (文字/分)</div>
      <div className="overflow-x-auto">
        <svg width={svgWidth} height={height} className="bg-gray-50">
          {/* グリッド線 */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* KPM折れ線 */}
          <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2" />

          {/* データポイント */}
          {points.map((point, index) => (
            <g key={index}>
              <circle cx={point.x} cy={point.y} r="3" fill="#3b82f6" />
              <text
                x={point.x}
                y={point.y - 8}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-mono"
              >
                {point.key}
              </text>
            </g>
          ))}

          {/* Y軸ラベル */}
          <text x="5" y="15" className="text-xs fill-gray-600">
            {maxKpm}
          </text>
          <text x="5" y={svgHeight - 5} className="text-xs fill-gray-600">
            {minKpm}
          </text>
        </svg>
      </div>
    </div>
  )
}
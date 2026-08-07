import { scoreTone } from '../../lib/scoreColors'

interface ScoreDonutProps {
  score: number | null
  size?: number
  stroke?: number
}

export function ScoreDonut({ score, size = 58, stroke = 5.5 }: ScoreDonutProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = score ?? 0
  const tone = scoreTone(score)
  const dash = Math.max((v / 100) * c, 0)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={tone.hex}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${tone.text} text-[15px] font-bold tabular-nums`}>
          {score != null ? Math.round(score) : '–'}
        </span>
      </div>
    </div>
  )
}
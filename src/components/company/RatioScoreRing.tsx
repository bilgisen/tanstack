interface RatioScoreRingProps {
  label: string
  score: number  // 0-100
  color?: string
  size?: number
}

export function RatioScoreRing({ label, score, color, size = 64 }: RatioScoreRingProps) {
  const strokeWidth = 4
  const radius = (size / 2) - strokeWidth
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const ringColor = color || (score >= 70 ? '#10b981' : score >= 40 ? '#eab308' : '#ef4444')

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/20"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold font-mono text-foreground">
            {score.toFixed(0)}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
        {label}
      </span>
    </div>
  )
}

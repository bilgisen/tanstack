interface Shareholder {
  name: string
  share_pct?: number | null
}

interface OwnershipPieChartProps {
  shareholders?: Array<Shareholder> | null
}

const COLORS = [
  'hsl(222, 85%, 55%)',
  'hsl(160, 78%, 42%)',
  'hsl(32, 92%, 55%)',
  'hsl(280, 65%, 58%)',
  'hsl(190, 75%, 48%)',
  'hsl(350, 70%, 55%)',
  'hsl(120, 55%, 45%)',
  'hsl(40, 80%, 50%)',
  'hsl(300, 50%, 55%)',
  'hsl(15, 75%, 50%)',
]

export function OwnershipPieChart({ shareholders }: OwnershipPieChartProps) {
  if (!shareholders || shareholders.length === 0) return null

  const total = shareholders.reduce((s, h) => s + (h.share_pct ?? 0), 0)
  if (total === 0) return null

  let cumulative = 0
  const segments = shareholders.map((h) => {
    const pct = ((h.share_pct ?? 0) / total) * 100
    const start = cumulative
    cumulative += pct
    return { ...h, pct, cssStop: `${start}% ${cumulative}%` }
  })

  const gradient = segments
    .map((s, i) => `${COLORS[i % COLORS.length]} ${s.cssStop}`)
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut with conic-gradient */}
      <div className="relative w-48 h-48 shrink-0">
        <div
          className="w-full h-full rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        />
        {/* Center hole */}
        <div className="absolute inset-[22%] rounded-full bg-card" />
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted-foreground truncate max-w-[140px]">
              {s.name}
            </span>
            <span className="font-semibold tabular-nums">
              {s.share_pct != null ? `%${s.share_pct.toFixed(2)}` : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

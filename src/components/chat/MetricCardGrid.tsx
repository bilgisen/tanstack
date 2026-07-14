interface MetricItem {
  label: string
  value: string
  color?: 'up' | 'down' | 'neutral' | 'warning'
  subtitle?: string
}

interface MetricCardGridProps {
  items: MetricItem[]
  columns?: 2 | 3 | 4
}

const colorClasses: Record<string, string> = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  neutral: 'text-muted-foreground',
  warning: 'text-amber-500',
}

export function MetricCardGrid({ items, columns = 3 }: MetricCardGridProps) {
  if (items.length === 0) return null

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-2 my-3`}
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, items.length)}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <div key={i} className="bg-muted/10 border border-border/15 rounded-xl px-3 py-2.5 text-center">
          <div className={`text-lg font-bold font-mono ${colorClasses[item.color || 'neutral']}`}>
            {item.value}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            {item.label}
          </div>
          {item.subtitle && (
            <div className="text-[9px] text-muted-foreground/60 mt-0.5">{item.subtitle}</div>
          )}
        </div>
      ))}
    </div>
  )
}

interface MetricItem {
  label: string
  value: string
  color?: 'up' | 'down' | 'neutral' | 'warning'
  subtitle?: string
}

interface MetricCardGridProps {
  items: Array<MetricItem>
  columns?: 2 | 3 | 4
  onCardClick?: (label: string, value: string) => void
}

const colorClasses: Record<string, string> = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  neutral: 'text-muted-foreground',
  warning: 'text-amber-500',
}

export function MetricCardGrid({ items, columns = 3, onCardClick }: MetricCardGridProps) {
  if (items.length === 0) return null

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-2 my-3`}
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, items.length)}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onCardClick?.(item.label, item.value)}
          className="bg-muted/10 border border-border/15 rounded-xl px-3 py-2.5 text-center transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm active:scale-95 cursor-pointer"
        >
          <div className={`text-lg font-bold font-mono ${colorClasses[item.color || 'neutral']}`}>
            {item.value}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            {item.label}
          </div>
          {item.subtitle && (
            <div className="text-[9px] text-muted-foreground/60 mt-0.5">{item.subtitle}</div>
          )}
        </button>
      ))}
    </div>
  )
}

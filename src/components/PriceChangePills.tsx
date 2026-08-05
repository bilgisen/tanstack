const fmtPct = (v: number | null | undefined) => {
  if (v == null || isNaN(v)) return '-'
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

interface PriceChangePillsProps {
  week?: number | null
  month?: number | null
  year?: number | null
}

export function PriceChangePills({ week, month, year }: PriceChangePillsProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
      <span>
        Hafta:{' '}
        <span className={`font-semibold tabular-nums ${(week ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
          {fmtPct(week)}
        </span>
      </span>
      <span>
        Ay:{' '}
        <span className={`font-semibold tabular-nums ${(month ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
          {fmtPct(month)}
        </span>
      </span>
      <span>
        Yıl:{' '}
        <span className={`font-semibold tabular-nums ${(year ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
          {fmtPct(year)}
        </span>
      </span>
    </div>
  )
}
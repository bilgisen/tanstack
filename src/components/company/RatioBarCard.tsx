interface RatioBarCardProps {
  label: string
  companyValue: number | null
  sectorMedian: number | null
  percentile: number | null
  formattedValue: string
  formattedMedian: string
  higherIsBetter: boolean
}

export function RatioBarCard({
  label,
  companyValue,
  sectorMedian,
  percentile,
  formattedValue,
  formattedMedian,
  higherIsBetter,
}: RatioBarCardProps) {
  if (companyValue === null) return null

  // Calculate bar positions (0-100 scale based on percentile)
  const pct = percentile ?? 50
  const barColor = pct > 60 ? 'bg-emerald-500' : pct < 40 ? 'bg-red-500' : 'bg-blue-500'
  const textColor = pct > 60 ? 'text-emerald-500' : pct < 40 ? 'text-red-500' : 'text-blue-500'

  // Determine if company is above or below median
  const isAbove = sectorMedian !== null && (
    higherIsBetter ? companyValue > sectorMedian : companyValue < sectorMedian
  )

  return (
    <div className="group py-3">
      {/* Label + Values row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-foreground/80 font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold font-mono text-foreground">{formattedValue}</span>
          {sectorMedian !== null && (
            <span className="text-xs text-muted-foreground font-mono">
              Sektör: {formattedMedian}
            </span>
          )}
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 bg-muted/25 rounded-full overflow-hidden">
        {/* Sector median marker */}
        {sectorMedian !== null && (
          <div
            className="absolute top-0 h-full w-px bg-muted-foreground/40"
            style={{ left: '50%' }}
          />
        )}

        {/* Company bar from center */}
        <div
          className={`absolute top-0 h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{
            left: '50%',
            width: `${Math.abs(pct - 50)}%`,
            transform: pct < 50 ? 'translateX(-100%)' : 'translateX(0)',
          }}
        />
      </div>

      {/* Percentile label */}
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-[10px] font-medium ${textColor}`}>
          %{pct} percentile
        </span>
        {sectorMedian !== null && (
          <span className={`text-[10px] font-medium ${isAbove ? 'text-emerald-500' : 'text-red-500'}`}>
            {isAbove ? 'Sektör üstünde' : 'Sektör altında'}
          </span>
        )}
      </div>
    </div>
  )
}

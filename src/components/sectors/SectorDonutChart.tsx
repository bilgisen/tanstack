import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { SafeTooltip } from '../ui/typed-tooltip'
import { SECTOR_COLORS } from '../../constants/sectorGroups'
import { cn } from '../../lib/utils'
import type { PieSectorDataItem } from 'recharts'

export interface SectorDonutData {
  name: string
  value: number
  color?: string
}

interface SectorDonutChartProps {
  data: Array<SectorDonutData>
  onItemClick?: (item: SectorDonutData, index: number) => void
  innerRadius?: number
  outerRadius?: number
  height?: number
  legendColumns?: string
  centerLabel?: { value: string; label: string }
  showLegendValues?: boolean
}

const TOOLTIP_STYLE = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '13px',
}

export function SectorDonutChart({
  data,
  onItemClick,
  innerRadius = 50,
  outerRadius = 100,
  height = 240,
  legendColumns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  centerLabel,
  showLegendValues = true,
}: SectorDonutChartProps) {
  const cleaned = data.filter((d) => d.value > 0)
  if (cleaned.length === 0) return null

  const total = cleaned.reduce((s, d) => s + d.value, 0)
  const interactive = !!onItemClick

  const handlePieClick = (datum: PieSectorDataItem, index: number) => {
    if (!onItemClick) return
    const resolvedIndex = cleaned.findIndex((d) => d.name === datum.name)
    const finalIndex = resolvedIndex >= 0 ? resolvedIndex : index
    const item = cleaned[finalIndex]
    if (item) onItemClick(item, finalIndex)
  }

  const getColor = (i: number) => cleaned[i].color || SECTOR_COLORS[i % SECTOR_COLORS.length]

  return (
    <div className="flex w-full flex-col md:flex-row items-center gap-8">
      <div className="relative w-full max-w-[240px] shrink-0">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={cleaned}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              strokeWidth={0}
              onClick={interactive ? handlePieClick : undefined}
              cursor={interactive ? 'pointer' : 'default'}
            >
              {cleaned.map((_, i) => (
                <Cell key={i} fill={getColor(i)} className={interactive ? 'transition-opacity hover:opacity-80' : ''} />
              ))}
            </Pie>
            <SafeTooltip
              formatter={(value): string =>
                `${Number(value ?? 0).toLocaleString('tr-TR')} · ${((Number(value ?? 0) / total) * 100).toFixed(1)}%`
              }
              contentStyle={TOOLTIP_STYLE}
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground tabular-nums">{centerLabel.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{centerLabel.label}</div>
            </div>
          </div>
        )}
      </div>

      <div className={cn('grid w-full flex-1 gap-x-6 gap-y-1.5 text-sm', legendColumns)}>
        {cleaned.map((d, i) => {
          const pct = d.value / total
          const swatch = (
            <span
              className="inline-block w-2.5 h-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getColor(i) }}
            />
          )
          const label = (
            <span className={cn('min-w-0 truncate text-muted-foreground', !showLegendValues && 'flex-1')}>
              {d.name}
            </span>
          )
          const value = showLegendValues ? (
            <span className="ml-auto shrink-0 font-mono font-semibold tabular-nums text-foreground">
              {d.value}
              <span className="text-muted-foreground/70"> · %{pct.toFixed(1)}</span>
            </span>
          ) : null

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onItemClick?.(d, i)}
                className="group flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/40"
                title={d.name}
              >
                {swatch}
                {label}
                {value}
                <ChevronRightIcon className={cn(
                  'h-3 w-3 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary',
                  showLegendValues && 'ml-1'
                )} />
              </button>
            )
          }

          return (
            <div key={i} className="flex items-center gap-2 px-1">
              {swatch}
              {label}
              {value}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
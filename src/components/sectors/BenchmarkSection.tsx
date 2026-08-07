import { BarChart3 } from 'lucide-react'
import { getBenchmarkCategory, getBenchmarkLabel } from '../../constants/sectorBenchmarks'

export interface BenchmarkValue {
  median_ew: number | null
  p25: number | null
  p75: number | null
  n_peers?: number | null
}

interface BenchmarkSectionProps {
  benchmarks: Record<string, BenchmarkValue>
  variant?: 'grup' | 'sektor'
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function BenchmarkSection({ benchmarks, variant = 'grup' }: BenchmarkSectionProps) {
  const entries = Object.entries(benchmarks).map(([code, b]) => ({
    code,
    label: getBenchmarkLabel(code),
    category: getBenchmarkCategory(code),
    median: b.median_ew,
    p25: b.p25,
    p75: b.p75,
  }))
  const categories = [...new Set(entries.map((e) => e.category))]
  if (entries.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/20">
        <BarChart3 size={14} className="text-primary" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Benchmark</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {variant === 'grup' ? 'Grup medyan değerleri' : 'Sektör medyan değerleri'}
        </span>
      </div>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat}>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {entries.filter((e) => e.category === cat).map((e) => (
                <div key={e.code} className="p-2.5 bg-muted/10 border border-border/10">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{e.label}</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">{fmt(e.median, 2)}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">
                    P25: {fmt(e.p25, 2)} · P75: {fmt(e.p75, 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
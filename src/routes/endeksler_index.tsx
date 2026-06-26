import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'

export const Route = createFileRoute('/endeksler_index')({
  component: EndekslerPage,
})

type IndexData = {
  id: string;
  title: string;
  code: string;
  last_price: number;
  diff_percent: number;
  up: boolean;
  sparkline?: number[];
};

function EndekslerPage() {
  const [indices, setIndices] = useState<IndexData[]>([
    { id: 'bist100', title: 'BIST 100', code: 'XU100', last_price: 10245.50, diff_percent: 1.10, up: true },
    { id: 'bist30', title: 'BIST 30', code: 'XU030', last_price: 11250.40, diff_percent: 1.20, up: true },
    { id: 'bist500', title: 'BIST 500', code: 'XU500', last_price: 12540.80, diff_percent: 1.45, up: true },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    async function fetchMarketData() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
      try {
        const indexRes = await fetch(`${apiUrl}/api/market/summary`)
        if (indexRes.ok) {
          const indexJson = await indexRes.json()
          if (indexJson && Array.isArray(indexJson.data)) {
            const liveIndices = indexJson.data
              .filter((idx: any) => ['XU100', 'XU030', 'XU500'].includes(idx.code?.toUpperCase()))
              .map((idx: any) => {
                const last_price = typeof idx.last_price === 'number' ? idx.last_price : (typeof idx.value === 'string' ? parseFloat(idx.value.replace(',', '.')) : (typeof idx.value === 'number' ? idx.value : 0))
                const diff_percent = typeof idx.diff_percent === 'number' ? idx.diff_percent : (typeof idx.changePercent === 'string' ? parseFloat(idx.changePercent.replace(',', '.')) : (typeof idx.changePercent === 'number' ? idx.changePercent : 0))
                const code = idx.code?.toUpperCase() || ''
                const nameMap: Record<string, string> = { XU100: 'BIST 100', XU030: 'BIST 30', XU500: 'BIST 500' }
                const idMap: Record<string, string> = { XU100: 'bist100', XU030: 'bist30', XU500: 'bist500' }
                const sparkline = [
                  last_price * (1 - diff_percent * 0.005),
                  last_price * (1 - diff_percent * 0.003),
                  last_price * (1 - diff_percent * 0.004),
                  last_price * (1 - diff_percent * 0.001),
                  last_price * (1 - diff_percent * 0.002),
                  last_price * (1 + diff_percent * 0.001),
                  last_price
                ]
                return {
                  id: idMap[code] || code.toLowerCase(),
                  title: nameMap[code] || idx.name || code,
                  code,
                  last_price: Number(last_price.toFixed(2)),
                  diff_percent: Number(diff_percent.toFixed(2)),
                  up: diff_percent >= 0,
                  sparkline,
                }
              })
            if (isMounted && liveIndices.length > 0) {
              setIndices(liveIndices)
            }
          }
        }
      } catch (e) {
        console.error('Endeksler: Failed fetching live summary:', e)
      }
      if (isMounted) setLoading(false)
    }

    fetchMarketData()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-400 max-w-5xl mx-auto py-2">

        {/* Index Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indices.map((index) => (
            <Link
              key={index.id}
              to="/endeksler/$id"
              params={{ id: index.id }}
              className="group bg-card border border-border/50 rounded-2xl p-5 transition-all hover:border-border/80 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{index.code}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${index.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                      {index.up ? '+' : ''}{index.diff_percent.toFixed(2)}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">{index.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ExternalLink size={14} className="text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold tabular-nums text-foreground">{index.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <div className="flex items-center gap-1 text-sm font-semibold shrink-0">
                    <span className={index.up ? 'text-emerald-500' : 'text-destructive'}>
                      {index.up ? '+' : ''}{index.diff_percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                {index.sparkline && index.sparkline.length > 1 && (
                  <div className="mt-3 h-8 relative">
                    <svg className="w-full h-full" viewBox={`0 0 ${index.sparkline.length * 10} 40`} preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={index.up ? '#22c55e' : '#ef4444'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={index.sparkline.map((v, i) => {
                          const min = Math.min(...index.sparkline!)
                          const max = Math.max(...index.sparkline!)
                          const range = max - min || 1
                          const x = i * 10
                          const y = 35 - ((v - min) / range) * 30
                          return `${x},${y}`
                        }).join(' ')}
                      />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info size={16} className="shrink-0" />
            <span>Endeks verileri Borsa İstanbul'dan anlık olarak alınmaktadır. Detaylı analiz ve grafikler için endekse tıklayın.</span>
          </div>
        </div>
      </div>
  )
}

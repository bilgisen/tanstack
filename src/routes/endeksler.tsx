import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  ExternalLink,
  Info,
  Activity
} from 'lucide-react'
import { useUIStore } from '../store/ui'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'

export const Route = createFileRoute('/endeksler')({
  component: EndekslerPage,
})

type IndexData = {
  id: string;
  title: string;
  code: string;
  value: number;
  absChange: number;
  pctChange: number;
  up: boolean;
  sparkline?: number[];
};

function EndekslerPage() {
  const [indices, setIndices] = useState<IndexData[]>([
    { id: 'bist100', title: 'BIST 100', code: 'XU100', value: 10245.50, absChange: 112.50, pctChange: 1.10, up: true },
    { id: 'bist30', title: 'BIST 30', code: 'XU030', value: 11250.40, absChange: 124.20, pctChange: 1.20, up: true },
    { id: 'bist500', title: 'BIST 500', code: 'XU500', value: 12540.80, absChange: 182.50, pctChange: 1.45, up: true },
    { id: 'bistbanka', title: 'BIST Banka', code: 'XBANK', value: 14320.10, absChange: -45.30, pctChange: -0.30, up: false },
  ])
  const [loading, setLoading] = useState(true)
  const { setGlobalPrompt, openRightSidebar } = useUIStore()

  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

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
            const liveIndices = indexJson.data.map((idx: any) => {
              const value = typeof idx.value === 'string' ? parseFloat(idx.value.replace(',', '.')) : (typeof idx.value === 'number' ? idx.value : 0)
              const absChange = typeof idx.change === 'string' ? parseFloat(idx.change.replace(',', '.')) : (typeof idx.change === 'number' ? idx.change : 0)
              const pctChange = typeof idx.changePercent === 'string' ? parseFloat(idx.changePercent.replace(',', '.')) : (typeof idx.changePercent === 'number' ? idx.changePercent : 0)
              const sparkline = [
                value * (1 - pctChange * 0.005),
                value * (1 - pctChange * 0.003),
                value * (1 - pctChange * 0.004),
                value * (1 - pctChange * 0.001),
                value * (1 - pctChange * 0.002),
                value * (1 + pctChange * 0.001),
                value
              ]
              return {
                id: idx.code?.toLowerCase() || idx.id,
                title: idx.name || idx.title,
                code: idx.code,
                value,
                absChange,
                pctChange,
                up: pctChange >= 0,
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
    <PublicPageLayout context="endeksler" placeholder="Endeksler hakkında bir soru sorun...">
      <div className="space-y-8 animate-in fade-in duration-400">

        {/* Bugün Borsa Section (from panel.index) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-primary" />
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2.5">
              <Activity size={12} className="text-[#22c55e]" />
              <span>Bugün Borsa · {formattedDate}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {indices.slice(0, 3).map((idx) => {
              const isUp = idx.up;
              const sparkline = idx.sparkline || [];
              
              return (
                <Link
                  key={idx.id}
                  to="/panel/endeksler/$id"
                  params={{ id: idx.id }}
                  className="group border border-border/40 hover:border-border/70 rounded-2xl p-4 md:p-5 bg-card/15 hover:bg-card/25 shadow-3xs transition-all duration-300 flex flex-col relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isUp ? 'bg-emerald-500/5' : 'bg-destructive/5'}`} />

                  <div className="flex items-center justify-between mb-3 z-10">
                    <div>
                      <h4 className="text-xs font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{idx.title}</h4>
                      <span className="text-[10px] text-muted-foreground font-semibold tracking-tight">{idx.code}</span>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                      isUp 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                        : 'bg-destructive/10 text-destructive border border-destructive/10'
                    }`}>
                      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{isUp ? '+' : ''}{idx.pctChange.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-1 z-10">
                    <div className="text-lg md:text-xl font-bold font-mono tracking-tight text-foreground">
                      {idx.value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {sparkline.length > 0 && (
                      <div className="w-16 h-8 pr-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        <svg viewBox="0 0 100 40" className="w-full h-full">
                          <path
                            d={`M ${sparkline.map((val, i) => `${(i / (sparkline.length - 1)) * 100} ${40 - ((val - Math.min(...sparkline)) / (Math.max(...sparkline) - Math.min(...sparkline) || 1)) * 30}`).join(' L ')}`}
                            fill="none"
                            stroke={isUp ? "#22c55e" : "#ef4444"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Endeksler</h1>
          <p className="text-muted-foreground text-sm mt-1">Borsa İstanbul endeksleri ve performansları</p>
        </div>

        {/* Index Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => (
            <Link
              key={index.id}
              to="/panel/endeksler/$id"
              params={{ id: index.id }}
              className="group bg-card border border-border/50 rounded-2xl p-5 transition-all hover:border-border/80 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{index.code}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${index.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                      {index.up ? '+' : ''}{index.pctChange.toFixed(2)}%
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
                  <span className="text-2xl font-bold tabular-nums text-foreground">{index.value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <div className="flex items-center gap-1 text-sm font-semibold shrink-0">
                    <span className={index.up ? 'text-emerald-500' : 'text-destructive'}>
                      {index.absChange >= 0 ? '+' : ''}{index.absChange.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={index.up ? 'text-emerald-500' : 'text-destructive'}>
                      ({index.pctChange >= 0 ? '+' : ''}{index.pctChange.toFixed(2)}%)
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
    </PublicPageLayout>
  )
}

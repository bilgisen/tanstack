import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Bar, BarChart, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { ArrowUpDown, BarChart3, ChevronRight, Search, Shield, Sparkles, TrendingUp, X } from 'lucide-react'
import { fetchCompCompareContext, useCompCompare } from '../lib/useCompData'
import { ScoreGauge } from '../constants/companyShared'
import { getRatioLabel } from '../constants/ratios'

type PillarEntry = { score: number }

type CompareCompany = {
  ticker: string
  composite_score: number
  percentile?: number | null
  sector?: string
  reliability?: string | null
  absolute: { label: string } | null
  pillars: Record<string, PillarEntry>
  key_ratios: Record<string, number | null>
  ratio_percentiles?: Record<string, number | null>
}

export const Route = createFileRoute('/karsilastir')({
  component: ComparePage,
  validateSearch: (search: Record<string, string | undefined>) => ({
    t: search.t || '',
  }),
})

const ABSOLUTE_LABEL_COLORS: Record<string, string> = {
  GÜÇLÜ: 'text-emerald-500', SAĞLIKLI: 'text-emerald-400',
  ORTA: 'text-yellow-500', ZAYIF: 'text-orange-500', KRİTİK: 'text-red-500',
}
const ABSOLUTE_LABEL_BG: Record<string, string> = {
  GÜÇLÜ: 'bg-emerald-500/10', SAĞLIKLI: 'bg-emerald-400/10',
  ORTA: 'bg-yellow-500/10', ZAYIF: 'bg-orange-500/10', KRİTİK: 'bg-red-500/10',
}
const PILLAR_COLORS = ['#22c55e', '#494fdf', '#f59e0b', '#f43f5e', '#06b6d4']
const PILLAR_LABELS: Record<string, string> = {
  finansal_saglik: 'Finansal Sağlık', karlilik_buyume: 'Karlılık & Büyüme', degerleme: 'Değerleme',
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function AbsoluteBadge({ label }: { label: string }) {
  const color = ABSOLUTE_LABEL_COLORS[label] || 'text-muted-foreground'
  const bg = ABSOLUTE_LABEL_BG[label] || 'bg-muted/20'
  return <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 ${bg} ${color}`}>{label}</span>
}

const KNOWN_TICKERS = [
  'THYAO','EREGL','AEFES','ASELS','TUPRS','SAHOL','YKBNK','GARAN','AKBNK','ISCTR',
  'VAKBN','HALKB','ALBRK','TCELL','TTKOM','SISE','SASA','KCHOL','FROTO','TOASO',
  'BIMAS','SOKM','ULKER','PETKM','PGSUS','TAVHL','TKFEN','ZOREN','OTKAR','KRDMD',
  'HEKTS','KONTR','MGROS','KOZAL','KOZAA','OYAKC','DOHOL','ENKAI','GUBRF','ISGYO',
]

function CompanySearch({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<string>>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (query.length < 1) { setResults([]); return }
    const upper = query.toUpperCase()
    const matches = KNOWN_TICKERS.filter(t => t.startsWith(upper)).slice(0, 8)
    setResults(matches)
    setOpen(matches.length > 0)
  }, [query])

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text" value={query} onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => results.length > 0 && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Hisse ara (GARAN, THYAO...)"
          className="w-40 h-9 pl-8 pr-3 text-xs bg-muted/20 border border-border/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-popover border border-border/20 shadow-lg z-50">
          {results.map(t => (
            <button key={t} onMouseDown={() => { onSelect(t); setQuery(''); setOpen(false) }}
              className="w-full px-3 py-2 text-xs text-left text-foreground hover:bg-primary/10 flex items-center gap-2">
              <span className="font-mono font-bold">{t}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ComparePage() {
  const navigate = useNavigate()
  const { t: tickerParam } = Route.useSearch()
  const tickers = tickerParam ? tickerParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : []
  const { data: compareData, isLoading, error } = useCompCompare(tickers)

  const result = compareData as { tickers: Array<CompareCompany> } | null
  const companies = result?.tickers || []

  function addTicker(newT: string) {
    if (!tickers.includes(newT)) {
      const next = [...tickers, newT].slice(0, 5)
      navigate({ to: '/karsilastir', search: { t: next.join(',') } })
    }
  }

  function removeTicker(t: string) {
    const next = tickers.filter(x => x !== t)
    if (next.length === 0) navigate({ to: '/karsilastir', search: { t: '' } })
    else navigate({ to: '/karsilastir', search: { t: next.join(',') } })
  }

  const pillarChartData = companies.length > 0
    ? Object.keys(PILLAR_LABELS).map(pillarKey => {
        const entry: Record<string, string | number | null> = { pillar: PILLAR_LABELS[pillarKey] }
        companies.forEach(c => { entry[c.ticker] = c.pillars?.[pillarKey]?.score ?? null })
        return entry
      })
    : []

  const radarData = companies.length > 0
    ? Object.keys(PILLAR_LABELS).map(pillarKey => {
        const entry: Record<string, string | number> = { pillar: PILLAR_LABELS[pillarKey] }
        companies.forEach(c => { entry[c.ticker] = Math.round(c.pillars?.[pillarKey]?.score ?? 0) })
        return entry
      })
    : []

  const allRatioKeys = new Set<string>()
  companies.forEach(c => { if (c.key_ratios) Object.keys(c.key_ratios).forEach(k => allRatioKeys.add(k)) })
  const ratioTableData = Array.from(allRatioKeys).map(code => {
    const entry: Record<string, string | number | null> = { code, name: getRatioLabel(code) }
    companies.forEach(c => {
      entry[c.ticker] = c.key_ratios?.[code] ?? null
    })
    return entry
  })

  const [aiContext, setAiContext] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  useEffect(() => {
    let cancelled = false
    setAiContext(null)
    if (tickers.length < 2) return
    setAiLoading(true)
    fetchCompCompareContext(tickers)
      .then(ctx => { if (!cancelled && ctx) setAiContext(JSON.stringify(ctx, null, 2)) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setAiLoading(false) })
    return () => { cancelled = true }
  }, [tickers.join(',')])

  if (tickers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <ArrowUpDown size={32} className="text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">Hisse Karşılaştırma</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">En az 2 hisse seçerek skor, rasyo ve performans karşılaştırması yapın.</p>
        <div className="flex gap-2 flex-wrap justify-center max-w-lg">
          {['GARAN', 'AKBNK', 'ISCTR', 'THYAO', 'EREGL', 'ASELS'].map(t => (
            <button key={t} onClick={() => navigate({ to: '/karsilastir', search: { t } })}
              className="px-4 py-2 text-sm font-mono font-bold text-foreground bg-muted/20 hover:bg-primary/10 border border-border/20 transition-colors">
              + {t}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Bir hisse seçin, ardından karşılaştırmak için sağ üstten ekleyin.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Karşılaştırma</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {tickers.map((t, i) => (
            <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-muted/20 border border-border/20 text-foreground">
              {t}
              <button onClick={() => removeTicker(t)} className="hover:text-red-400 transition-colors"><X size={12} /></button>
              {i < tickers.length - 1 && <ChevronRight size={12} className="text-muted-foreground" />}
            </span>
          ))}
        </div>
        {tickers.length < 5 && <CompanySearch onSelect={addTicker} />}
        {tickers.length < 2 && (
          <span className="text-[10px] text-yellow-500">En az 2 hisse seçin</span>
        )}
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="h-48 bg-muted/20 animate-pulse" />)}
        </div>
      )}

      {error && (
        <div className="p-6 text-center text-sm text-red-400 bg-red-500/5 border border-red-500/20">
          Veri yüklenemedi. Lütfen tekrar deneyin.
        </div>
      )}

      {!isLoading && companies.length === 0 && !error && (
        <div className="p-6 text-center text-sm text-muted-foreground">
          Karşılaştırma verisi bulunamadı.
        </div>
      )}

      {companies.length > 0 && (
        <>
          {/* ═══ SCORE CARDS ═══ */}
          <div className={`grid grid-cols-1 gap-4 ${companies.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {companies.map((c: CompareCompany) => (
              <Link key={c.ticker} to="/hisse/$ticker/temel-analiz" params={{ ticker: c.ticker.toLowerCase() }}
                className="block p-4 bg-muted/10 border border-border/10 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <ScoreGauge score={Math.round(c.composite_score)} size={64} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-foreground">{c.ticker}</span>
                      {c.absolute && <AbsoluteBadge label={c.absolute.label} />}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      {c.percentile != null && (
                        <span className="font-medium">Piyasa %{fmt(c.percentile, 0)}</span>
                      )}
                      {c.sector && <span className="truncate">{c.sector}</span>}
                    </div>
                    <div className="mt-2 space-y-1">
                      {Object.entries(c.pillars).map(([key, p]: [string, PillarEntry]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-muted/20">
                            <div className="h-full transition-all duration-500" style={{ width: `${p.score}%`, backgroundColor: PILLAR_COLORS[Object.keys(c.pillars).indexOf(key) % PILLAR_COLORS.length] }} />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{Math.round(p.score)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ═══ PILLAR COMPARISON CHART ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <BarChart3 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Bileşen Karşılaştırması</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pillarChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="pillar" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)' }} />
                  {companies.map((c: CompareCompany, i: number) => (
                    <Bar key={c.ticker} dataKey={c.ticker} fill={PILLAR_COLORS[i % PILLAR_COLORS.length]} fillOpacity={0.7} radius={[3, 3, 0, 0]} maxBarSize={32} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ═══ RADAR CHART ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Shield size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Radar Karşılaştırma</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" strokeOpacity={0.3} />
                  <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }} />
                  {companies.map((c: CompareCompany, i: number) => (
                    <Radar key={c.ticker} name={c.ticker} dataKey={c.ticker} stroke={PILLAR_COLORS[i % PILLAR_COLORS.length]} fill={PILLAR_COLORS[i % PILLAR_COLORS.length]} fillOpacity={0.15} strokeWidth={1.5} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ═══ RATIO TABLE ═══ */}
          {ratioTableData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <TrendingUp size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Rasyo Karşılaştırması</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/10">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium uppercase tracking-wider">Rasyo</th>
                      {companies.map((c: CompareCompany) => (
                        <th key={c.ticker} className="text-right py-2 px-3 font-mono font-bold text-foreground">{c.ticker}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ratioTableData.map(row => {
                      const vals = companies.map(c => row[c.ticker]).filter((v): v is number => v != null)
                      const numeric = vals.filter((v): v is number => typeof v === 'number')
                      const best = row.code === 'pe' || row.code === 'pb' || row.code === 'debt_equity'
                        ? Math.min(...numeric) : Math.max(...numeric)
                      return (
                        <tr key={row.code} className="border-b border-border/5 hover:bg-muted/5">
                          <td className="py-2 pr-4 text-foreground font-medium">{row.name}</td>
                          {companies.map(c => {
                            const val = row[c.ticker]
                            const isBest = val != null && vals.length >= 2 && val === best
                            const pct = c.ratio_percentiles?.[String(row.code)] ?? null
                            return (
                              <td key={c.ticker} className={`text-right py-2 px-3 font-mono transition-colors ${isBest ? 'text-emerald-400 font-bold' : 'text-muted-foreground'}`}>
                                {fmt(val as number | null | undefined)}
                                {pct != null && val != null && (
                                  <span className="ml-1.5 text-[9px] text-muted-foreground/60">p{fmt(pct, 0)}</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ AI COMPARISON CONTEXT ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Sparkles size={14} className="text-violet-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Karşılaştırma</h3>
            </div>
            <div className="p-4 bg-muted/5 border border-border/10 min-h-24">
              {aiLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-muted/20 animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted/20 animate-pulse" />
                  <div className="h-3 w-2/3 bg-muted/20 animate-pulse" />
                </div>
              ) : aiContext ? (
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
                  {JSON.stringify(aiContext, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground">AI karşılaştırma verisi bekleniyor...</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

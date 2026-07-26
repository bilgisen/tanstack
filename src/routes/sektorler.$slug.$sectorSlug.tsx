import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Factory, Loader2, BarChart3, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useCompSectorDetail } from '../lib/useCompData'
import { groupSlugToDisplayName, slugToSectorName } from '../constants/sectorGroups'

export const Route = createFileRoute('/sektorler/$slug/$sectorSlug')({
  component: SektorDetailPage,
})

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

const BENCHMARK_LABELS: Record<string, string> = {
  pe: 'F/K', pb: 'PD/DD', ev_ebitda: 'FD/FAVÖK', ev_sales: 'FD/Satışlar',
  current_ratio: 'Cari Oran', cash_ratio: 'Nakit Oranı', debt_equity: 'Borç/Özkaynak',
  interest_coverage: 'Faiz Karş. Oranı',
  roe: 'ROE', roa: 'ROA', net_margin: 'Net Kar Marjı', gross_margin: 'Brüt Kar Marjı',
  profit_growth: 'Kar Büyümesi',
  eps: 'HBK', book_per_share: 'Defter Değeri', inventory_turnover: 'Stok Devir Hızı',
}

export function getSectorNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
}

function SektorDetailPage() {
  const { slug, sectorSlug } = Route.useParams()
  const navigate = useNavigate()
  const groupName = groupSlugToDisplayName(slug) || slug
  const sectorName = slugToSectorName(sectorSlug) || getSectorNameFromSlug(sectorSlug)

  const { data: sectorData, isLoading: loading } = useCompSectorDetail(sectorName)

  const companyCount = sectorData?.company_count || 0
  const benchmarks = sectorData?.benchmarks || {}
  const leaderboard = sectorData?.leaderboard || []

  const chatContext = `sector:${sectorName}`

  const benchEntries = Object.entries(benchmarks).slice(0, 10).map(([code, b]) => ({
    code, label: BENCHMARK_LABELS[code] || code, median: b.median_ew, p25: b.p25, p75: b.p75,
  }))

  const leaderData = leaderboard.slice(0, 15).map(c => ({
    name: c.ticker, score: c.composite_score || 0, ticker: c.ticker,
  })).reverse()

  const hasBenchmarks = benchEntries.length > 0
  const hasLeaderboard = leaderData.length > 0

  if (loading) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}>
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor, lütfen bekleyin...</span>
        </div>
      </PublicPageLayout>
    )
  }

  return (
    <PublicPageLayout context={chatContext} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}>
      <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

        <Link to="/sektorler/$slug" params={{ slug }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          {groupName}
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Factory size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  <Link to="/sektorler/$slug" params={{ slug }} className="hover:text-foreground">{groupName}</Link>
                  <span className="mx-1.5">·</span>
                  Sektör
                </span>
              </div>
              <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none mt-1">{sectorName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{companyCount}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Şirket</div>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{leaderboard.length}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Skorlu</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasBenchmarks && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <BarChart3 size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Benchmark</h3>
                <span className="text-[10px] text-muted-foreground ml-auto">Medyan değerler</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchEntries} layout="vertical" margin={{ top: 0, right: 0, left: 80, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={75} />
                    <Tooltip
                      formatter={(val) => typeof val === 'number' ? fmt(val) : val}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                    />
                    <Bar dataKey="median" radius={[0, 3, 3, 0]} maxBarSize={14}>
                      {benchEntries.map((_, i) => (
                        <Cell key={i} fill="var(--primary)" fillOpacity={0.6 - (i * 0.04)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {hasLeaderboard && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <TrendingUp size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sıralama</h3>
                <span className="text-[10px] text-muted-foreground ml-auto">{leaderboard.length} şirket</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderData} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip
                      formatter={(val) => typeof val === 'number' ? val.toFixed(1) : String(val)}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                      cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                    />
                    <Bar dataKey="score" radius={[0, 3, 3, 0]} maxBarSize={12} onClick={(entry) => { const e = entry as { ticker?: string } | undefined; if (e?.ticker) navigate({ to: `/hisse/${e.ticker.toLowerCase()}` }) }} style={{ cursor: 'pointer' }}>
                      {leaderData.map((_, i) => (
                        <Cell key={i} fill="var(--primary)" fillOpacity={0.4 + (i / leaderData.length) * 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {!hasBenchmarks && !hasLeaderboard && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Bu sektör için skorlu şirket bulunamadı.
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}

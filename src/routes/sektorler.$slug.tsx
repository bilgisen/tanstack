import { createFileRoute, Link, Outlet, useMatches, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Factory, Loader2, BarChart3, TrendingUp, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useCompSectorDetail, useSectorGroups } from '../lib/useCompData'
import { slugToGroupKey, groupKeyToDisplayName, sectorNameToSlug } from '../constants/sectorGroups'

export const Route = createFileRoute('/sektorler/$slug')({
  component: SektorGroupLayout,
})

function SektorGroupLayout() {
  const matches = useMatches()
  const hasSectorChild = matches.some(m => m.routeId === '/sektorler/$slug/$sectorSlug')

  if (hasSectorChild) {
    return <Outlet />
  }

  return <SektorGroupPage />
}

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

function SektorGroupPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const groupKey = slugToGroupKey(slug) || slug
  const displayName = groupKeyToDisplayName(groupKey) || slug

  const { data: sectorData, isLoading: loading } = useCompSectorDetail(groupKey)
  const { data: groupsData } = useSectorGroups()

  const sectorList = (groupsData?.sectors || [])
    .filter((s: any) => s.consolidated === groupKey && s.sector_main !== displayName)
    .sort((a: any, b: any) => (b.cnt || 0) - (a.cnt || 0))

  const detail = sectorData as any || {}
  const benchmarks: Record<string, any> = detail.benchmarks || {}
  const leaderboard: any[] = detail.leaderboard || []
  const companyCount = detail.company_count || 0

  const chatContext = `sector-group:${slug}`

  const benchEntries = Object.entries(benchmarks).slice(0, 10).map(([code, b]: [string, any]) => ({
    code,
    label: BENCHMARK_LABELS[code] || code,
    median: b.median_ew,
    p25: b.p25,
    p75: b.p75,
  }))

  const leaderData = leaderboard.slice(0, 15).map((c: any) => ({
    name: c.ticker,
    score: c.composite_score || 0,
    ticker: c.ticker,
  })).reverse()

  const hasBenchmarks = benchEntries.length > 0
  const hasLeaderboard = leaderData.length > 0

  if (loading) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${displayName} hakkında bir soru sorun...`}>
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor, lütfen bekleyin...</span>
        </div>
      </PublicPageLayout>
    )
  }

  return (
    <PublicPageLayout context={chatContext} placeholder={`${displayName} hakkında bir soru sorun...`}>
      <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

        <Link to="/sektorler" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          Sektörlere Dön
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Factory size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sektör Grubu</span>
              <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none mt-1">{displayName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            {companyCount > 0 && (
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{companyCount}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Şirket</div>
              </div>
            )}
            {sectorList.length > 0 && (
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{sectorList.length}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Alt Sektör</div>
              </div>
            )}
            {detail.sector_score?.equal_weight != null && (
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{fmt(detail.sector_score.equal_weight, 1)}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Ort. Skor</div>
              </div>
            )}
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchEntries} layout="vertical" margin={{ top: 0, right: 0, left: 80, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={75} />
                    <Tooltip
                      formatter={(val: any) => fmt(val)}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                    />
                    <Bar dataKey="median" radius={[0, 3, 3, 0]} maxBarSize={16}>
                      {benchEntries.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? 'var(--primary)' : 'var(--primary)'} fillOpacity={0.7 - (i * 0.05)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {hasBenchmarks && benchEntries.length >= 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <BarChart3 size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Karşılaştırma</h3>
                <span className="text-[10px] text-muted-foreground ml-auto">P25 · Medyan · P75</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={benchEntries.slice(0, 6).map(b => ({
                    ...b,
                    normalized: b.median !== 0 ? Math.min(Math.abs(b.median) / Math.max(...benchEntries.slice(0, 6).map(x => Math.abs(x.median)))) * 100 : 0,
                  }))}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar name="Medyan" dataKey="median" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={1.5} />
                  </RadarChart>
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderData} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip
                      formatter={(val: any) => `${typeof val === 'number' ? val.toFixed(1) : val}`}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                      cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                    />
                    <Bar dataKey="score" radius={[0, 3, 3, 0]} maxBarSize={12} onClick={(entry: any) => entry?.ticker && navigate({ to: `/hisse/${entry.ticker.toLowerCase()}` })} style={{ cursor: 'pointer' }}>
                      {leaderData.map((_, i) => (
                        <Cell key={i} fill={i >= leaderData.length - 3 ? 'var(--destructive)' : i >= leaderData.length - 5 ? 'var(--primary)' : 'var(--primary)'} fillOpacity={0.5 + (i / leaderData.length) * 0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {sectorList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <Building2 size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Alt Sektörler</h3>
                <span className="text-[10px] text-muted-foreground ml-auto">{sectorList.length} sektör</span>
              </div>
              <div className="divide-y divide-border/10">
                {sectorList.map((s: any) => {
                  const sectorSlug = sectorNameToSlug(s.sector_main)
                  return (
                    <Link
                      key={s.sector_main}
                      to="/sektorler/$slug/$sectorSlug"
                      params={{ slug, sectorSlug }}
                      className="flex items-center justify-between py-2.5 px-1 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary text-[10px] shrink-0">
                          <Factory size={11} />
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">{s.sector_main}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2 font-mono">{s.cnt} şirket</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {!hasBenchmarks && !hasLeaderboard && sectorList.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Bu sektör grubu için veri bulunamadı.
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}

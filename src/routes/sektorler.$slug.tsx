import { Link, Outlet, createFileRoute, useMatches, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BarChart3, Building2, Factory, Loader2, TrendingUp } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useMemo } from 'react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import {  DataTable } from '../components/ui/data-table'
import { useCompSectorDetail, useSectorGroups } from '../lib/useCompData'
import { groupKeyToDisplayName, sectorNameToSlug, slugToGroupKey } from '../constants/sectorGroups'
import type {Column} from '../components/ui/data-table';

export const Route = createFileRoute('/sektorler/$slug')({
  component: SektorGroupLayout,
})

const GROUP_COLORS = [
  '#494fdf', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#f43f5e', '#0ea5e9', '#f97316', '#14b8a6', '#64748b',
  '#e11d48', '#6366f1', '#d946ef', '#84cc16', '#78716c',
]

function SektorGroupLayout() {
  const matches = useMatches()
  const hasSectorChild = matches.some(m => m.routeId === '/sektorler/$slug/$sectorSlug')
  if (hasSectorChild) return <Outlet />
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

const BENCHMARK_CATEGORIES: Record<string, string> = {
  pe: 'Değerleme', pb: 'Değerleme', ev_ebitda: 'Değerleme', ev_sales: 'Değerleme',
  current_ratio: 'Likidite', cash_ratio: 'Likidite', debt_equity: 'Fin. Sağlık', interest_coverage: 'Fin. Sağlık',
  roe: 'Karlılık', roa: 'Karlılık', net_margin: 'Karlılık', gross_margin: 'Karlılık',
  profit_growth: 'Büyüme',
  eps: 'Hisse Başı', book_per_share: 'Hisse Başı', inventory_turnover: 'Verimlilik',
}

function SektorGroupPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const groupKey = slugToGroupKey(slug) || slug
  const displayName = groupKeyToDisplayName(groupKey) || slug

  const { data: sectorData, isLoading: loading } = useCompSectorDetail(groupKey)
  const { data: groupsData } = useSectorGroups()

  const sectorList = (groupsData?.sectors || [])
    .filter(s => s.consolidated === groupKey && s.sector_main !== displayName)
    .sort((a, b) => (b.cnt || 0) - (a.cnt || 0))

  const benchmarks = sectorData?.benchmarks || {}
  const leaderboard = sectorData?.leaderboard || []
  const companyCount = sectorData?.company_count || 0

  const chatContext = `sector-group:${slug}`

  const benchEntries = Object.entries(benchmarks).map(([code, b]) => ({
    code, label: BENCHMARK_LABELS[code] || code, category: BENCHMARK_CATEGORIES[code] || 'Diğer',
    median: b.median_ew, p25: b.p25, p75: b.p75,
  }))
  const categories = [...new Set(benchEntries.map(b => b.category))]
  const hasBenchmarks = benchEntries.length > 0
  const hasLeaderboard = leaderboard.length > 0

  const pieData = sectorList.map(s => ({
    name: s.sector_main,
    value: s.cnt || 0,
  }))
  const hasPie = pieData.filter(d => d.value > 0).length > 0

  const withRank = useMemo(() =>
    leaderboard.map((r, i) => ({ ...r, _rank: i + 1 })),
  [leaderboard])

  const leaderboardColumns: Array<Column<Record<string, unknown>>> = useMemo(() => [
    {
      key: '_rank', header: '#', sortable: false,
      render: (r: Record<string, unknown>) => <span className="text-[10px]">{String(r._rank)}</span>,
      className: 'w-8 text-muted-foreground font-mono',
    },
    {
      key: 'ticker', header: 'Hisse', sortable: true,
      render: (r: Record<string, unknown>) => <span className="font-mono font-bold text-foreground">{r.ticker as string}</span>,
    },
    {
      key: 'name', header: 'Şirket', sortable: true,
      render: (r: Record<string, unknown>) => <span className="text-muted-foreground text-[11px] truncate max-w-[140px] inline-block">{r.name as string}</span>,
    },
    {
      key: 'composite_score', header: 'Skor', sortable: true,
      render: (r: Record<string, unknown>) => {
        const score = (r.composite_score ?? 0) as number
        const color = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
        return <span className={`font-mono font-bold ${color}`}>{fmt(score, 0)}</span>
      },
      className: 'text-right',
    },
    {
      key: 'pillar_finansal_saglik', header: 'Fin. Sağlık', sortable: true,
      render: (r: Record<string, unknown>) => {
        const val = r.pillar_finansal_saglik as number | null
        if (val == null) return <span className="text-muted-foreground/40">—</span>
        const color = val >= 70 ? 'text-emerald-400' : val >= 40 ? 'text-yellow-400' : 'text-red-400'
        return <span className={`font-mono ${color}`}>{fmt(val, 0)}</span>
      },
      className: 'text-right',
    },
    {
      key: 'pillar_karlilik_buyume', header: 'Karlılık', sortable: true,
      render: (r: Record<string, unknown>) => {
        const val = r.pillar_karlilik_buyume as number | null
        if (val == null) return <span className="text-muted-foreground/40">—</span>
        const color = val >= 70 ? 'text-emerald-400' : val >= 40 ? 'text-yellow-400' : 'text-red-400'
        return <span className={`font-mono ${color}`}>{fmt(val, 0)}</span>
      },
      className: 'text-right',
    },
    {
      key: 'pillar_degerleme', header: 'Değerleme', sortable: true,
      render: (r: Record<string, unknown>) => {
        const val = r.pillar_degerleme as number | null
        if (val == null) return <span className="text-muted-foreground/40">—</span>
        const color = val >= 70 ? 'text-emerald-400' : val >= 40 ? 'text-yellow-400' : 'text-red-400'
        return <span className={`font-mono ${color}`}>{fmt(val, 0)}</span>
      },
      className: 'text-right',
    },
  ], [])

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
            {sectorData?.sector_score?.equal_weight != null && (
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{fmt(sectorData.sector_score.equal_weight, 1)}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Ort. Skor</div>
              </div>
            )}
          </div>
        </div>

        {/* Donut chart + legend */}
        {hasPie && (
          <div className="flex flex-col md:flex-row items-center gap-8 pb-4 border-b border-border/20">
            <div className="w-full max-w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={1.5} strokeWidth={0}>
                    {pieData.filter(d => d.value > 0).map((_, i) => (
                      <Cell key={i} fill={GROUP_COLORS[i % GROUP_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val} şirket`} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
              {pieData.filter(d => d.value > 0).slice(0, 12).map((item, i) => (
                <div key={i} className="flex items-center gap-2 min-w-0">
                  <span className="inline-block w-2 h-2 shrink-0" style={{ backgroundColor: GROUP_COLORS[i % GROUP_COLORS.length] }} />
                  <span className="text-muted-foreground truncate text-xs">{item.name}</span>
                  <span className="font-mono font-semibold tabular-nums text-foreground text-xs ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmark cards */}
        {hasBenchmarks && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <BarChart3 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Benchmark</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">Grup medyan değerleri</span>
            </div>
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat}>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {benchEntries.filter(b => b.category === cat).map(b => (
                      <div key={b.code} className="p-2.5 bg-muted/10 border border-border/10">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{b.label}</div>
                        <div className="text-sm font-bold font-mono text-foreground mt-0.5">{fmt(b.median, 2)}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          P25: {fmt(b.p25, 2)} · P75: {fmt(b.p75, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-sectors */}
        {sectorList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Building2 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Alt Sektörler</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">{sectorList.length} sektör</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {sectorList.map(s => {
                const sectorSlug = sectorNameToSlug(s.sector_main)
                return (
                  <Link
                    key={s.sector_main}
                    to="/sektorler/$slug/$sectorSlug"
                    params={{ slug, sectorSlug }}
                    className="flex items-center justify-between px-2.5 py-2 bg-muted/10 border border-border/10 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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

        {/* Leaderboard table */}
        {hasLeaderboard && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <TrendingUp size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sıralama</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">{leaderboard.length} şirket</span>
            </div>
            <DataTable
              columns={leaderboardColumns}
              data={withRank}
              onRowClick={(r) => navigate({ to: `/hisse/${(r.ticker).toLowerCase()}` })}
              className="text-base"
            />
          </div>
        )}

        {!hasBenchmarks && !hasLeaderboard && sectorList.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Bu sektör grubu için veri bulunamadı.
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}

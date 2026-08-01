import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BarChart3, Factory, Loader2, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useCompSectorDetail } from '../lib/useCompData'
import {  DataTable } from '../components/ui/data-table'
import { groupSlugToDisplayName, slugToSectorName } from '../constants/sectorGroups'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import type {Column} from '../components/ui/data-table';

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

const BENCHMARK_CATEGORIES: Record<string, string> = {
  pe: 'Değerleme', pb: 'Değerleme', ev_ebitda: 'Değerleme', ev_sales: 'Değerleme',
  current_ratio: 'Likidite', cash_ratio: 'Likidite', debt_equity: 'Fin. Sağlık', interest_coverage: 'Fin. Sağlık',
  roe: 'Karlılık', roa: 'Karlılık', net_margin: 'Karlılık', gross_margin: 'Karlılık',
  profit_growth: 'Büyüme',
  eps: 'Hisse Başı', book_per_share: 'Hisse Başı', inventory_turnover: 'Verimlilik',
}

export function getSectorNameFromSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/\s+/g, ' ')
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

  const starterQuestions = [
    'Bu sektörde en düşük F/K oranına sahip iskontolu hisseler hangileri?',
    'Sektörde en yüksek ROE\'ye sahip şirketler hangileri?',
    'Sektörün medyan rasyoları (F/K, PD/DD, ROE) nasıl?',
    'Sektörün genel değerleme görünümü nasıl?',
  ]

  const benchEntries = Object.entries(benchmarks).map(([code, b]) => ({
    code, label: BENCHMARK_LABELS[code] || code, category: BENCHMARK_CATEGORIES[code] || 'Diğer',
    median: b.median_ew, p25: b.p25, p75: b.p75,
  }))
  const categories = [...new Set(benchEntries.map(b => b.category))]
  const hasBenchmarks = benchEntries.length > 0
  const hasLeaderboard = leaderboard.length > 0

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
      <PublicPageLayout context={chatContext} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`} starterQuestions={starterQuestions}>
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

        {/* Benchmark cards */}
        {hasBenchmarks && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <BarChart3 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Benchmark</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">Sektör medyan değerleri</span>
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

        {!hasBenchmarks && !hasLeaderboard && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Bu sektör için skorlu şirket bulunamadı.
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}

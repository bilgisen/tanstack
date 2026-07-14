import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Factory, Loader2, BarChart3, TrendingUp } from 'lucide-react'
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

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground'
  if (score >= 70) return 'text-emerald-500'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function getScoreBg(score: number | null) {
  if (score === null) return 'bg-muted/20'
  if (score >= 70) return 'bg-emerald-500/10'
  if (score >= 50) return 'bg-amber-500/10'
  return 'bg-red-500/10'
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

  const detail = sectorData as any || {}
  const benchmarks: Record<string, any> = detail.benchmarks || {}
  const leaderboard: any[] = detail.leaderboard || []
  const companyCount = detail.company_count || 0

  const chatContext = `sector:${sectorName}`

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
            <div className="h-12 w-12 bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
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

        {Object.keys(benchmarks).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
              <BarChart3 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sektör Benchmark</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">Medyan değerler</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(benchmarks).slice(0, 8).map(([code, b]: [string, any]) => (
                <div key={code} className="bg-muted/10 border border-border/20 px-3 py-2.5">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{BENCHMARK_LABELS[code] || code}</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">{fmt(b.median_ew)}</div>
                  {b.p25 != null && b.p75 != null && (
                    <div className="text-[9px] text-muted-foreground mt-0.5">P25: {fmt(b.p25)} · P75: {fmt(b.p75)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {leaderboard.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
              <TrendingUp size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sıralama</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">{leaderboard.length} şirket</span>
            </div>
            <div className="divide-y divide-white/5">
              {leaderboard.map((company: any) => (
                <div
                  key={company.ticker}
                  onClick={() => navigate({ to: `/hisse/${company.ticker.toLowerCase()}` })}
                  className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">{company.rank}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {company.ticker}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{company.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-lg font-black font-mono ${getScoreColor(company.composite_score)} ${getScoreBg(company.composite_score)} px-2.5 py-0.5`}>
                      {company.composite_score != null ? company.composite_score.toFixed(1) : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {leaderboard.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Bu sektör için skorlu şirket bulunamadı.
              </div>
            )}
          </div>
        )}

      </div>
    </PublicPageLayout>
  )
}

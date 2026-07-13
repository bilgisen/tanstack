import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2, Factory, BarChart3, TrendingUp, ArrowUp, ArrowDown, Minus, ChevronRight } from 'lucide-react'
import { useCompScore, useCompProfile } from '../lib/useCompData'
import { groupKeyToSlug, groupKeyToDisplayName, sectorNameToGroupKey } from '../constants/sectorGroups'

export const Route = createFileRoute('/hisse/$ticker/sektor')({
  component: CompanySektorPage,
})

const RATIO_LABELS: Record<string, string> = {
  pe: 'F/K', pb: 'PD/DD', ev_ebitda: 'FD/FAVÖK', ev_sales: 'FD/Satışlar',
  current_ratio: 'Cari Oran', cash_ratio: 'Nakit Oranı', debt_equity: 'Borç/Özkaynak',
  interest_coverage: 'Faiz Karş. Oranı',
  roe: 'ROE', roa: 'ROA', net_margin: 'Net Kar Marjı', gross_margin: 'Brüt Kar Marjı',
  profit_growth: 'Kar Büyümesi',
  eps: 'HBK', book_per_share: 'Defter Değeri', inventory_turnover: 'Stok Devir Hızı',
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtPct(val: number | null | undefined): string {
  if (val == null) return '—'
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
}

function ComparisonRow({ label, companyVal, peerMedian, higherIsBetter }: { label: string; companyVal: number | null; peerMedian: number | null; higherIsBetter?: boolean }) {
  if (companyVal == null) return null
  const actualHiB = higherIsBetter ?? true
  let diff: number | null = null
  let direction: 'up' | 'down' | 'equal' | null = null
  if (peerMedian != null && peerMedian !== 0) {
    diff = ((companyVal - peerMedian) / Math.abs(peerMedian)) * 100
    if (actualHiB) {
      direction = companyVal > peerMedian ? 'up' : companyVal < peerMedian ? 'down' : 'equal'
    } else {
      direction = companyVal < peerMedian ? 'up' : companyVal > peerMedian ? 'down' : 'equal'
    }
  }

  return (
    <div className="flex items-center justify-between py-2.5 px-1 border-b border-border/10 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold font-mono text-foreground">{fmt(companyVal)}</span>
        {direction && (
          <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
            <span className="text-xs font-mono text-muted-foreground">{fmt(peerMedian)}</span>
            {direction === 'up' && <ArrowUp size={12} className="text-emerald-500 shrink-0" />}
            {direction === 'down' && <ArrowDown size={12} className="text-red-500 shrink-0" />}
            {direction === 'equal' && <Minus size={12} className="text-muted-foreground shrink-0" />}
            {diff != null && (
              <span className={`text-[10px] font-mono ${direction === 'up' ? 'text-emerald-500' : direction === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                {fmtPct(diff)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CompanySektorPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const { data: scoreData, isLoading: scoreLoading } = useCompScore(tickerUpper)
  const { data: profileData, isLoading: profileLoading } = useCompProfile(tickerUpper)

  const loading = scoreLoading || profileLoading
  const score = (scoreData as any) || null
  const profile = (profileData as any) || null
  const sectorName = profile?.sector || score?.sector || ''
  const groupKey = sectorNameToGroupKey(sectorName)
  const groupSlug = groupKey ? groupKeyToSlug(groupKey) : null

  if (loading) {
    return (
      <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
        <Loader2 className="animate-spin text-primary" size={16} />
        <span>Yükleniyor...</span>
      </div>
    )
  }

  if (!score && !profile) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Sektör verisi bulunamadı.
      </div>
    )
  }

  const benchmarks = score?.pillars
  const ranks = score?.ranks || {}
  const bench = score?.benchmark || {}
  const ratios = score?.ratios || {}

  const pillarMedians: Record<string, number | null> = {}
  if (benchmarks) {
    for (const pname of ['finansal_saglik', 'karlilik_buyume', 'degerleme']) {
      const details = benchmarks[pname]?.details || []
      for (const d of details) {
        if (d.peer_median != null) {
          pillarMedians[d.ratio_code] = d.peer_median
        }
      }
    }
  }

  const higherIsBetter: Record<string, boolean> = {
    current_ratio: true, cash_ratio: true, debt_equity: false, interest_coverage: true,
    roe: true, roa: true, net_margin: true, gross_margin: true, profit_growth: true,
    pe: false, pb: false, ev_ebitda: false, ev_sales: false,
  }

  const priorityRatios = ['pe', 'pb', 'ev_ebitda', 'roe', 'net_margin', 'current_ratio', 'debt_equity']
  const availableRatios = priorityRatios.filter(rc => ratios[rc] != null)

  return (
    <div className="space-y-5 animate-in fade-in duration-400">

      {sectorName && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Factory size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sektör / Grup</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-foreground">{sectorName}</span>
                {groupSlug && (
                  <>
                    <ChevronRight size={12} className="text-muted-foreground" />
                    <Link to="/sektorler/$slug" params={{ slug: groupSlug }} className="text-sm font-semibold text-primary hover:underline">
                      {groupKeyToDisplayName(groupKey!)}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-3 border-t border-border/20">
            <div className="text-center">
              <div className="text-lg font-black text-foreground">{score?.composite_score != null ? score.composite_score.toFixed(1) : '—'}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Skor</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-foreground">{ranks.sector?.percentile != null ? `${ranks.sector.percentile.toFixed(0)}.` : '—'}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Yüzdelik (Sektör)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-foreground">{ranks.group?.percentile != null ? `${ranks.group.percentile.toFixed(0)}.` : '—'}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Yüzdelik (Grup)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-foreground">{bench.n_peers || '—'}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Emsal Şirket</div>
            </div>
          </div>
        </div>
      )}

      {availableRatios.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
            <BarChart3 size={14} className="text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sektör Karşılaştırması</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Şirket · Sektör Medyanı</span>
          </div>
          <div>
            {availableRatios.map(rc => (
              <ComparisonRow
                key={rc}
                label={RATIO_LABELS[rc] || rc}
                companyVal={ratios[rc]}
                peerMedian={pillarMedians[rc] ?? null}
                higherIsBetter={higherIsBetter[rc]}
              />
            ))}
          </div>
        </div>
      )}

      {ranks.sector?.n_peers && ranks.sector.n_peers > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
            <TrendingUp size={14} className="text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sektör Pozisyonu</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {sectorName} sektöründe <strong className="text-foreground">{ranks.sector.n_peers}</strong> şirket arasında yüzdelik dilimi <strong className="text-foreground">%{ranks.sector.percentile?.toFixed(0)}</strong>.
            {groupKey && ranks.group?.n_peers && (
              <span className="block mt-1">
                {groupKeyToDisplayName(groupKey)} grubunda <strong className="text-foreground">{ranks.group.n_peers}</strong> şirket arasında yüzdelik dilimi <strong className="text-foreground">%{ranks.group.percentile?.toFixed(0)}</strong>.
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

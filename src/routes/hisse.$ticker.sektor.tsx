import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, BarChart3, ChevronRight, Factory, Loader2, Minus, TrendingUp } from 'lucide-react'
import { useCompProfile, useCompScore } from '../lib/useCompData'
import { groupKeyToDisplayName, groupKeyToSlug, sectorNameToGroupKey } from '../constants/sectorGroups'
import { HIGHER_IS_BETTER, RATIO_DEFS,  getRatioLabel } from '../constants/ratios'
import type {RatioCategory} from '../constants/ratios';

export const Route = createFileRoute('/hisse/$ticker/sektor')({
  component: CompanySektorPage,
})

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
  const sectorName = scoreData?.sector || profileData?.sector || ''
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

  if (!scoreData && !profileData) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Sektör verisi bulunamadı.
      </div>
    )
  }

  const benchmarks = scoreData?.pillars
  const ranks = scoreData?.ranks || {}
  const bench = scoreData?.benchmark || {}
  const ratiosMap = scoreData?.ratios || {}

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

  const higherIsBetter = HIGHER_IS_BETTER

  const priorityCodes = RATIO_DEFS.map(d => d.code)
  const availableRatios = priorityCodes.filter(rc => ratiosMap[rc] != null)

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
              <div className="text-lg font-black text-foreground">{scoreData?.composite_score != null ? scoreData.composite_score.toFixed(1) : '—'}</div>
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
              <div className="text-lg font-black text-foreground">{bench.n_peers != null ? String(bench.n_peers) : '—'}</div>
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
          {(['degerleme', 'karlilik', 'finansal_saglik', 'likidite', 'verimlilik', 'buyume', 'hisse_basi'] as Array<RatioCategory>).map(cat => {
            const catRatios = availableRatios.filter(rc => RATIO_DEFS.find(d => d.code === rc)?.category === cat)
            if (catRatios.length === 0) return null
            return (
              <div key={cat} className="mb-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 pb-1 border-b border-border/10">
                  {cat === 'degerleme' ? 'Değerleme' : cat === 'karlilik' ? 'Karlılık' : cat === 'finansal_saglik' ? 'Finansal Sağlık' : cat === 'likidite' ? 'Likidite' : cat === 'verimlilik' ? 'Verimlilik' : cat === 'buyume' ? 'Büyüme' : 'Hisse Başı'}
                </div>
                {catRatios.map(rc => (
                  <ComparisonRow
                    key={rc}
                    label={getRatioLabel(rc)}
                    companyVal={ratiosMap[rc]}
                    peerMedian={pillarMedians[rc] ?? null}
                    higherIsBetter={higherIsBetter[rc]}
                  />
                ))}
              </div>
            )
          })}
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

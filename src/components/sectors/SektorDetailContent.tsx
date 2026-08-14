import { Link, useNavigate } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { Loader2, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { getIndexName } from '../../constants/bistIndices'
import { HONO_API, fetchComp, useCompSectorDetail } from '../../lib/useCompData'
import { BenchmarkSection } from './BenchmarkSection'
import { LeaderboardSection } from './LeaderboardSection'
import type { IndexReturnsResponse } from '../../lib/useCompData'
import type { LeaderboardRow } from './LeaderboardSection'

interface IndexComponent {
  code: string
  change_ytd_pct?: number | null
}

function fmtIdxPct(val: number | null | undefined): string {
  if (val == null) return '—'
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
}

function IndexPerformanceSection({ codes }: { codes: Array<string> }) {
  const returnsQueries = useQueries({
    queries: codes.map(code => ({
      queryKey: ['comp', 'index-returns', code],
      queryFn: () => fetchComp<IndexReturnsResponse>(`/indices/${code}/returns`),
      staleTime: 3_600_000,
      gcTime: 86_400_000,
      enabled: !!code,
    })),
  })
  const componentsQueries = useQueries({
    queries: codes.map(code => ({
      queryKey: ['market', 'index-components', code],
      queryFn: async (): Promise<Array<IndexComponent>> => {
        try {
          const res = await fetch(`${HONO_API}/api/market/indices/${code}/components`)
          if (!res.ok) return []
          const j = await res.json()
          return Array.isArray(j.data) ? j.data : []
        } catch {
          return []
        }
      },
      staleTime: 3_600_000,
      gcTime: 86_400_000,
      enabled: !!code,
    })),
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
        <TrendingUp size={14} className="text-primary" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Endeks Performansı</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {codes.map((code, i) => {
          const ret = returnsQueries[i]?.data
          const comps = componentsQueries[i]?.data || []
          const indexYtd = ret?.returns?.YTD ?? null
          const beatsCount = comps.filter(c => c.change_ytd_pct != null && indexYtd != null && c.change_ytd_pct > indexYtd).length
          const pctCell = (val: number | null | undefined) => {
            const v = val ?? null
            const cls = v == null ? 'text-muted-foreground' : v >= 0 ? 'text-emerald-500' : 'text-red-500'
            return <span className={`font-mono font-bold tabular-nums ${cls}`}>{fmtIdxPct(v)}</span>
          }
          return (
            <div key={code} className="rounded-xl border border-border/20 p-3">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <Link
                  to="/endeksler/$id"
                  params={{ id: code.toLowerCase() }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors"
                >
                  <span className="font-mono">{code}</span>
                  <span className="text-muted-foreground font-normal">{getIndexName(code)}</span>
                </Link>
                <span className="text-[10px] text-muted-foreground">Bileşen: {ret?.component_count ?? '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([['1M', '1A'], ['YTD', 'Yılbaşı'], ['1Y', '1Y']] as const).map(([key, label]) => (
                  <div key={key} className="text-center">
                    <div className="text-[10px] text-muted-foreground font-medium uppercase">{label}</div>
                    <div className="mt-0.5">{pctCell(ret?.returns?.[key] ?? null)}</div>
                  </div>
                ))}
              </div>
              {indexYtd != null && comps.length > 0 && (
                <div className="mt-2.5 text-[10px] text-muted-foreground">
                  Endeksi geçen şirket: <strong className="text-foreground">{beatsCount}</strong>/{comps.length}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SektorDetailContent({ sectorName }: { sectorName: string }) {
  const navigate = useNavigate()

  const { data: sectorData, isLoading: loading } = useCompSectorDetail(sectorName)

  const benchmarks = sectorData?.benchmarks || {}
  const leaderboard = sectorData?.leaderboard || []

  const hasBenchmarks = Object.keys(benchmarks).length > 0
  const hasLeaderboard = leaderboard.length > 0

  const leaderboardRows: Array<LeaderboardRow> = useMemo(
    () => leaderboard.map(r => ({
      ticker: r.ticker,
      name: r.name,
      composite_score: r.composite_score,
      pillar_finansal_saglik: r.pillar_finansal_saglik,
      pillar_karlilik_buyume: r.pillar_karlilik_buyume,
      pillar_degerleme: r.pillar_degerleme,
    })),
    [leaderboard]
  )

  if (loading) {
    return (
      <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
        <Loader2 className="animate-spin text-primary" size={16} />
        <span>Veriler yükleniyor, lütfen bekleyin...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sectorData?.index_codes && sectorData.index_codes.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {sectorData.index_codes.map(code => (
              <Link
                key={code}
                to="/endeksler/$id"
                params={{ id: code.toLowerCase() }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <TrendingUp size={14} className="text-primary" />
                <span className="font-mono">{code}</span>
                <span className="text-muted-foreground font-normal">· {getIndexName(code) || 'BIST Endeksi'}</span>
              </Link>
            ))}
          </div>
          <IndexPerformanceSection codes={sectorData.index_codes} />
        </>
      )}

      {hasBenchmarks && (
        <BenchmarkSection benchmarks={benchmarks} variant="sektor" />
      )}

      {hasLeaderboard && (
        <LeaderboardSection
          leaderboard={leaderboardRows}
          onCompanyClick={(ticker) => navigate({ to: `/hisse/${ticker.toLowerCase()}` })}
        />
      )}

      {!hasBenchmarks && !hasLeaderboard && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Bu sektör için skorlu şirket bulunamadı.
        </div>
      )}
    </div>
  )
}

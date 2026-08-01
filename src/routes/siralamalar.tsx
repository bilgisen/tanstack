import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowUpDown, BarChart3, ChevronRight, Search, Shield, TrendingUp } from 'lucide-react'
import {  useCompRankings, useSectorGroups } from '../lib/useCompData'
import { groupKeyToDisplayName } from '../constants/sectorGroups'
import type {SectorGroupsResponse} from '../lib/useCompData';

type RankingItem = {
  ticker: string
  rank: number
  composite_score: number
  pillar_finansal_saglik: number | null
  pillar_karlilik_buyume: number | null
  pillar_degerleme: number | null
}

type RankingsResponse = {
  results: Array<RankingItem>
  total: number
  name: string
}

type SectorGroup = { key: string; name: string; count: number }
type SectorEntry = { sector_main: string; cnt: number; consolidated: string | null; consolidated_name: string | null }

export const Route = createFileRoute('/siralamalar')({
  component: SiralamalarPage,
  validateSearch: (search: Record<string, string | undefined>) => ({
    scope: search.scope || '',
    name: search.name || '',
  }),
})

const SCOPE_LABELS: Record<string, string> = {
  market: 'Pazar',
  sektor: 'Sektör',
  grup: 'Grup',
}
const PILLAR_LABELS: Record<string, string> = {
  finansal_saglik: 'Fin. Sağlık', karlilik_buyume: 'Karlılık', degerleme: 'Değerleme',
}

function fmt(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function RankingTable({ scope, name }: { scope: string; name: string }) {
  const { data, isLoading, error } = useCompRankings(scope, name)
  const result = data as RankingsResponse | null
  const results = result?.results || []
  const total = result?.total || 0
  const scopeName = result?.name || SCOPE_LABELS[scope] || name
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string>('rank')
  const [sortAsc, setSortAsc] = useState(true)

  const filtered = results.filter(r =>
    !search || r.ticker.includes(search.toUpperCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey as keyof RankingItem] as number | undefined
    const bv = b[sortKey as keyof RankingItem] as number | undefined
    if (av == null) return 1
    if (bv == null) return -1
    return sortAsc ? av - bv : bv - av
  })

  function toggleSort(key: string) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(key === 'rank') }
  }

  const SortHeader = ({ label, sort }: { label: string; sort: string }) => (
    <th className="text-right py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => toggleSort(sort)}>
      <div className="flex items-center justify-end gap-1">
        {label}
        {sortKey === sort && <span className="text-[8px]">{sortAsc ? '▲' : '▼'}</span>}
      </div>
    </th>
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse" />)}
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-center text-sm text-red-400 bg-red-500/5 border border-red-500/20">{scopeName} sıralaması yüklenemedi.</div>
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Hisse ara..." className="w-full h-9 pl-8 pr-3 text-xs bg-muted/20 border border-border/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40" />
      </div>

      {results.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">{scopeName} için sıralama verisi bulunamadı.</div>
      ) : (
        <>
          <div className="text-xs text-muted-foreground">{total} şirket içinden ilk {results.length}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/10">
                  <th className="text-left py-2 pr-2 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">#</th>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Hisse</th>
                  <SortHeader label="Skor" sort="composite_score" />
                  <SortHeader label={PILLAR_LABELS.finansal_saglik} sort="pillar_finansal_saglik" />
                  <SortHeader label={PILLAR_LABELS.karlilik_buyume} sort="pillar_karlilik_buyume" />
                  <SortHeader label={PILLAR_LABELS.degerleme} sort="pillar_degerleme" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r: RankingItem) => {
                  const score = r.composite_score
                  const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
                  return (
                    <tr key={r.ticker} className="border-b border-border/5 hover:bg-muted/5 transition-colors">
                      <td className="py-2 pr-2 font-mono text-muted-foreground text-[10px] w-8">{r.rank}</td>
                      <td className="py-2 pr-4">
                        <Link to="/hisse/$ticker/temel-analiz" params={{ ticker: r.ticker.toLowerCase() }}
                          className="font-mono font-bold text-foreground hover:text-primary transition-colors">
                          {r.ticker}
                        </Link>
                      </td>
                      <td className={`py-2 px-2 font-mono font-bold text-right ${scoreColor}`}>{fmt(score, 0)}</td>
                      <td className="py-2 px-2 font-mono text-right text-muted-foreground">{r.pillar_finansal_saglik != null ? fmt(r.pillar_finansal_saglik, 0) : '—'}</td>
                      <td className="py-2 px-2 font-mono text-right text-muted-foreground">{r.pillar_karlilik_buyume != null ? fmt(r.pillar_karlilik_buyume, 0) : '—'}</td>
                      <td className="py-2 px-2 font-mono text-right text-muted-foreground">{r.pillar_degerleme != null ? fmt(r.pillar_degerleme, 0) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function SiralamalarPage() {
  const { scope, name } = Route.useSearch()

  if (scope) {
    return <RankingTable scope={scope} name={name} />
  }

  return <LandingPage />
}

function LandingPage() {
  const { data, isLoading } = useSectorGroups()
  const groups = (data as SectorGroupsResponse | undefined)?.groups?.slice().sort((a, b) => (b.count || 0) - (a.count || 0)) || []
  const sectors = (data as SectorGroupsResponse | undefined)?.sectors?.filter(s => s.cnt > 0).slice().sort((a, b) => (b.cnt || 0) - (a.cnt || 0)) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 min-w-0">
        <ArrowUpDown size={20} className="text-primary" />
        <div>
          <h1 className="text-base font-bold text-foreground">Sıralamalar</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Sektör, grup ve pazar bazında sıralamalar</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/20 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Market */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">Pazar</h2>
            <Link to="/siralamalar" search={{ scope: 'market', name: '' }}
              className="flex items-center justify-between px-3 py-3 bg-muted/10 border border-border/10 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="text-primary" />
                <span className="text-sm font-bold text-foreground">BIST Tümü</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </Link>
          </div>

          {/* Groups */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">Konsolide Gruplar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {groups.map((g: SectorGroup) => (
                <Link key={g.key} to="/siralamalar" search={{ scope: 'grup', name: g.key }}
                  className="flex items-center justify-between px-3 py-2.5 bg-muted/10 border border-border/10 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BarChart3 size={14} className="text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate">{groupKeyToDisplayName(g.key) || g.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-muted-foreground">{g.count} şirket</span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">Sektörler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {sectors.map((s: SectorEntry) => (
                <Link key={s.sector_main} to="/siralamalar" search={{ scope: 'sektor', name: s.sector_main }}
                  className="flex items-center justify-between px-3 py-2 bg-muted/10 border border-border/10 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Shield size={12} className="text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">{s.sector_main}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">{s.cnt} şirket</span>
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

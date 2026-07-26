import { createFileRoute, Link } from '@tanstack/react-router'
import { useCompScreener, useSectorGroups, type SectorGroupsResponse, type ScreenerFilters } from '../lib/useCompData'
import { RATIO_DEFS } from '../constants/ratios'
import { useState, useMemo } from 'react'
import { Search, Filter, ChevronDown, SlidersHorizontal } from 'lucide-react'

type ScreenerResult = Record<string, unknown> & {
  ticker: string
  name?: string
  sector?: string
  composite_score?: number
  pillar_finansal_saglik?: number | null
  pillar_karlilik_buyume?: number | null
  pillar_degerleme?: number | null
  ratios?: Record<string, number | null>
}

export const Route = createFileRoute('/tarama')({
  component: TaramaPage,
  validateSearch: (search: Record<string, string | undefined>) => ({
    sector: search.sector || '',
    group: search.group || '',
    q: search.q || '',
  }),
})

const PILLAR_LABELS: Record<string, string> = {
  finansal_saglik: 'Fin. Sağlık', karlilik_buyume: 'Karlılık', degerleme: 'Değerleme',
}

function fmt(val: number | null | undefined, decimals = 1): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function TaramaPage() {
  const { sector: filterSector, group: filterGroup, q: searchQuery } = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: sectorData } = useSectorGroups()

  const [search, setSearch] = useState(searchQuery)
  const [scoreMin, setScoreMin] = useState(0)
  const [scoreMax, setScoreMax] = useState(100)
  const [showFilters, setShowFilters] = useState(false)
  const [showRatios, setShowRatios] = useState(false)
  const [selectedRatios, setSelectedRatios] = useState<string[]>(['pe', 'pb', 'roe', 'debt_equity'])
  const [ratioMin, setRatioMin] = useState<Record<string, string>>({})
  const [ratioMax, setRatioMax] = useState<Record<string, string>>({})
  const [sortKey, setSortKey] = useState('composite_score')
  const [sortAsc, setSortAsc] = useState(false)

  const groups = (sectorData as SectorGroupsResponse | undefined)?.groups || []
  const sectors = (sectorData as SectorGroupsResponse | undefined)?.sectors || []

  const filteredSectors = useMemo(() => {
    if (!filterGroup) return sectors
    return sectors.filter(s => s.consolidated === filterGroup)
  }, [sectors, filterGroup])

  const filters: ScreenerFilters = useMemo(() => {
    const f: ScreenerFilters = {}
    if (filterSector) f.sector = filterSector
    if (filterGroup) f.group = filterGroup
    if (search) f.q = search
    if (scoreMin > 0) f.score_min = scoreMin
    if (scoreMax < 100) f.score_max = scoreMax
    if (sortKey) { f.sort_by = sortKey; f.sort_dir = sortAsc ? 'asc' : 'desc' }
    for (const code of selectedRatios) {
      const mn = ratioMin[code]; const mx = ratioMax[code]
      if (mn) f[`${code}_min`] = Number(mn)
      if (mx) f[`${code}_max`] = Number(mx)
    }
    return f
  }, [filterSector, filterGroup, search, scoreMin, scoreMax, sortKey, sortAsc, selectedRatios, ratioMin, ratioMax])

  const { data: screenerData, isLoading } = useCompScreener(filters)

  const results = (screenerData as { results?: ScreenerResult[] } | null)?.results || []

  function setFilter(key: string, val: string) {
    const params = { sector: filterSector || '', group: filterGroup || '', q: searchQuery || '' } as { sector: string; group: string; q: string }
    if (key === 'sector') params.sector = val
    else if (key === 'group') { params.group = val; params.sector = '' }
    else if (key === 'q') params.q = val
    navigate({ to: '/tarama', search: params })
  }

  function resetAll() {
    setScoreMin(0); setScoreMax(100); setSearch('')
    setFilter('sector', ''); setFilter('group', '')
    setRatioMin({}); setRatioMax({})
    setSelectedRatios(['pe', 'pb', 'roe', 'debt_equity'])
  }

  const SortHeader = ({ label, sort }: { label: string; sort: string }) => (
    <th className="text-right py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider text-[10px] cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => { if (sortKey === sort) setSortAsc(!sortAsc); else { setSortKey(sort); setSortAsc(false) } }}>
      <div className="flex items-center justify-end gap-1">
        {label}
        {sortKey === sort && <span className="text-[8px]">{sortAsc ? '▲' : '▼'}</span>}
      </div>
    </th>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 min-w-0">
        <Filter size={20} className="text-primary" />
        <div>
          <h1 className="text-base font-bold text-foreground">Hisse Tarama</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Skor, sektör ve rasyolara göre filtrele</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse" />)}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/20 border border-border/20 text-foreground hover:bg-primary/10 transition-colors">
              <Filter size={12} /> Skor <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button onClick={() => setShowRatios(!showRatios)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/20 border border-border/20 text-foreground hover:bg-primary/10 transition-colors">
              <SlidersHorizontal size={12} /> Rasyo <ChevronDown size={12} className={`transition-transform ${showRatios ? 'rotate-180' : ''}`} />
            </button>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setFilter('q', e.target.value) }}
                placeholder="Hisse ara..." className="w-36 h-8 pl-8 pr-3 text-xs bg-muted/20 border border-border/20 text-foreground" />
            </div>

            <select value={filterGroup} onChange={e => { setFilter('group', e.target.value); setFilter('sector', '') }}
              className="h-8 px-2 text-xs bg-muted/20 border border-border/20 text-foreground">
              <option value="">Tüm Gruplar</option>
              {groups.map(g => <option key={g.key} value={g.key}>{g.name}</option>)}
            </select>

            <select value={filterSector} onChange={e => setFilter('sector', e.target.value)}
              className="h-8 px-2 text-xs bg-muted/20 border border-border/20 text-foreground">
              <option value="">Tüm Sektörler</option>
              {filteredSectors.map(s => <option key={s.sector_main} value={s.sector_main}>{s.sector_main}</option>)}
            </select>

            <span className="text-[10px] text-muted-foreground ml-auto">{results.length} şirket</span>
          </div>

          {showFilters && (
            <div className="p-3 bg-muted/10 border border-border/10 space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground">Min Skor: {scoreMin}</label>
                  <input type="range" min={0} max={100} value={scoreMin} onChange={e => setScoreMin(Number(e.target.value))}
                    className="w-full h-1 appearance-none bg-muted/30 accent-primary cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground">Max Skor: {scoreMax}</label>
                  <input type="range" min={0} max={100} value={scoreMax} onChange={e => setScoreMax(Number(e.target.value))}
                    className="w-full h-1 appearance-none bg-muted/30 accent-primary cursor-pointer" />
                </div>
                <button onClick={resetAll}
                  className="text-[10px] text-primary hover:text-primary/80 transition-colors">Sıfırla</button>
              </div>
            </div>
          )}

          {showRatios && (
            <div className="p-3 bg-muted/10 border border-border/10 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {RATIO_DEFS.map(r => (
                  <button key={r.code} onClick={() => {
                    setSelectedRatios(prev =>
                      prev.includes(r.code) ? prev.filter(c => c !== r.code) : [...prev, r.code]
                    )
                  }}
                    className={`px-2 py-0.5 text-[10px] border transition-colors ${selectedRatios.includes(r.code) ? 'bg-primary/20 border-primary/40 text-foreground' : 'bg-transparent border-border/20 text-muted-foreground'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
              {selectedRatios.map(code => {
                const def = RATIO_DEFS.find(r => r.code === code)
                if (!def) return null
                return (
                  <div key={code} className="flex items-center gap-2 text-[10px]">
                    <span className="w-16 text-muted-foreground font-medium">{def.label}</span>
                    <span className="text-muted-foreground">Min</span>
                    <input type="number" step="any" value={ratioMin[code] ?? ''}
                      onChange={e => setRatioMin(prev => ({ ...prev, [code]: e.target.value }))}
                      className="w-20 h-6 px-1.5 text-xs bg-muted/20 border border-border/20 text-foreground" />
                    <span className="text-muted-foreground">Max</span>
                    <input type="number" step="any" value={ratioMax[code] ?? ''}
                      onChange={e => setRatioMax(prev => ({ ...prev, [code]: e.target.value }))}
                      className="w-20 h-6 px-1.5 text-xs bg-muted/20 border border-border/20 text-foreground" />
                  </div>
                )
              })}
            </div>
          )}

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
                  {selectedRatios.map(code => {
                    const def = RATIO_DEFS.find(r => r.code === code)
                    return <SortHeader key={code} label={def?.label || code} sort={`ratios.${code}`} />
                  })}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan={6 + selectedRatios.length} className="py-8 text-center text-muted-foreground">Eşleşen şirket bulunamadı.</td></tr>
                ) : (
                  results.slice(0, 100).map((r: ScreenerResult, i: number) => {
                    const score = r.composite_score ?? 0
                    const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
                    const ratios = (r.ratios || {}) as Record<string, number | null>
                    return (
                      <tr key={r.ticker} className="border-b border-border/5 hover:bg-muted/5 transition-colors">
                        <td className="py-1.5 pr-2 font-mono text-muted-foreground text-[10px]">{i + 1}</td>
                        <td className="py-1.5 pr-4">
                          <Link to="/hisse/$ticker/temel-analiz" params={{ ticker: r.ticker.toLowerCase() }}
                            className="font-mono font-bold text-foreground hover:text-primary transition-colors">
                            {r.ticker}
                          </Link>
                        </td>
                        <td className={`py-1.5 px-2 font-mono font-bold text-right ${scoreColor}`}>{fmt(score, 0)}</td>
                        <td className="py-1.5 px-2 font-mono text-right text-muted-foreground">{r.pillar_finansal_saglik != null ? fmt(r.pillar_finansal_saglik, 0) : '—'}</td>
                        <td className="py-1.5 px-2 font-mono text-right text-muted-foreground">{r.pillar_karlilik_buyume != null ? fmt(r.pillar_karlilik_buyume, 0) : '—'}</td>
                        <td className="py-1.5 px-2 font-mono text-right text-muted-foreground">{r.pillar_degerleme != null ? fmt(r.pillar_degerleme, 0) : '—'}</td>
                        {selectedRatios.map(code => (
                          <td key={code} className="py-1.5 px-2 font-mono text-right text-muted-foreground">
                            {ratios[code] != null ? fmt(ratios[code], 2) : '—'}
                          </td>
                        ))}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {results.length > 100 && (
            <div className="text-center text-[10px] text-muted-foreground">İlk 100 sonuç gösteriliyor ({results.length} toplam)</div>
          )}
        </>
      )}
    </div>
  )
}

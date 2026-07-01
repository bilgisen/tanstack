import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { fetchCompanyData, type FundamentalData } from '../constants/companyShared'
import { DollarSign } from 'lucide-react'
import { CeoFundamentalReport } from '../components/company/CeoFundamentalReport'
import { RatioRadar } from '../components/company/RatioRadar'
import { RatioBarCard } from '../components/company/RatioBarCard'
import { RatioScoreRing } from '../components/company/RatioScoreRing'

export const Route = createFileRoute('/sektorler/$slug/$company/temel-analiz')({
  component: FundamentalAnalysisPage,
})

interface RatioItem {
  key: string
  label: string
  group: string
  value: number | null
  formattedValue: string
  sectorMedian: number | null
  percentile: number | null
  vsSector: string | null
  higherIsBetter: boolean
}

const RATIO_LABELS: Record<string, string> = {
  roe: 'ROE',
  roa: 'ROA',
  gross_margin: 'Brüt Marj',
  net_margin: 'Net Marj',
  operating_margin: 'Operasyonel Marj',
  ebitda_margin: 'FAVÖK Marj',
  current_ratio: 'Cari Oran',
  acid_test_ratio: 'Asit Test',
  debt_to_equity: 'Borç/Özkaynak',
  debt_ratio: 'Borçlanma',
  net_debt_to_equity: 'Net Borç/Özkaynak',
  asset_turnover: 'Aktif Devir',
}

const GROUP_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  karlilik: { label: 'Kârlılık', color: '#10b981', icon: '📈' },
  finansal: { label: 'Finansal Sağlık', color: '#3b82f6', icon: '🛡️' },
  verimlilik: { label: 'Verimlilik', color: '#8b5cf6', icon: '⚡' },
}

const GROUP_ASSIGNMENT: Record<string, string> = {
  roe: 'karlilik', roa: 'karlilik', gross_margin: 'karlilik',
  net_margin: 'karlilik', operating_margin: 'karlilik', ebitda_margin: 'karlilik',
  current_ratio: 'finansal', acid_test_ratio: 'finansal', debt_to_equity: 'finansal',
  debt_ratio: 'finansal', net_debt_to_equity: 'finansal',
  asset_turnover: 'verimlilik',
}

const RATIO_ORDER = ['karlilik', 'finansal', 'verimlilik']

function formatValue(key: string, value: number | null): string {
  if (value === null) return '-'
  if (['roe', 'roa', 'gross_margin', 'net_margin', 'operating_margin', 'ebitda_margin'].includes(key)) {
    return `%${(value * 100).toFixed(1)}`
  }
  return value.toFixed(2)
}

function FundamentalAnalysisPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [fundamental, setFundamental] = useState<FundamentalData | null>(null)
  const [ratios, setRatios] = useState<RatioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      const compUrl = import.meta.env.VITE_COMP_API_URL || 'https://comp-ef958063.fastapicloud.dev'
      try {
        const [companyResult, ratiosResult] = await Promise.all([
          fetchCompanyData(tickerUpper, slug),
          (async () => {
            try {
              const res = await fetch(`${compUrl}/api/v1/companies/${tickerUpper}/ratios`)
              if (res.ok) { const j = await res.json(); return j.ratios || {} }
            } catch (e) { console.error('ratios fetch failed', e) }
            return {}
          })(),
        ])
        if (!isMounted) return
        setFundamental(companyResult.fundamental)
        const items: RatioItem[] = []
        for (const [key, data] of Object.entries(ratiosResult) as any) {
          const label = RATIO_LABELS[key]
          if (!label) continue
          const group = GROUP_ASSIGNMENT[key]
          if (!group) continue
          const sc = data.sector_comparison
          items.push({
            key, label, group,
            value: data.value ?? null,
            formattedValue: formatValue(key, data.value ?? null),
            sectorMedian: sc?.sector_median ?? null,
            percentile: sc?.company_percentile ?? null,
            vsSector: sc?.vs_sector ?? null,
            higherIsBetter: GROUP_ASSIGNMENT[key] !== 'finansal',
          })
        }
        setRatios(items)
      } catch (e) { console.error('load failed', e) }
      setLoading(false)
    }
    load()
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  // Compute group averages for radar
  const groupStats = useMemo(() => {
    const stats: Record<string, { companyAvg: number; sectorAvg: number; count: number }> = {}
    for (const r of ratios) {
      if (!stats[r.group]) stats[r.group] = { companyAvg: 0, sectorAvg: 0, count: 0 }
      const pct = r.percentile ?? 50
      stats[r.group].companyAvg += pct
      stats[r.group].sectorAvg += 50 // sector median = 50th percentile by definition
      stats[r.group].count++
    }
    for (const g of Object.values(stats)) {
      if (g.count > 0) { g.companyAvg /= g.count; g.sectorAvg /= g.count }
    }
    return stats
  }, [ratios])

  // Radar data
  const radarData = useMemo(() => {
    return RATIO_ORDER
      .filter(g => groupStats[g])
      .map(g => ({
        label: GROUP_CONFIG[g].label,
        company: Math.round(groupStats[g].companyAvg),
        sector: 50,
      }))
  }, [groupStats])

  // Group ratios
  const grouped = useMemo(() => {
    const map: Record<string, RatioItem[]> = {}
    for (const r of ratios) {
      if (!map[r.group]) map[r.group] = []
      map[r.group].push(r)
    }
    return RATIO_ORDER.filter(g => map[g]).map(g => ({
      key: g,
      ...GROUP_CONFIG[g],
      ratios: map[g],
    }))
  }, [ratios])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-border/20">
        <span className="text-base font-semibold text-foreground">Rasyolar</span>
      </div>

      {/* F/K inline */}
      {fundamental && fundamental.fk !== '-' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Fiyat / Kazanç (F/K)</span>
          <span className="text-lg font-semibold font-mono text-foreground">{fundamental.fk}</span>
        </div>
      )}

      {/* Radar + Score Rings */}
      {radarData.length > 0 && (
        <div className="flex flex-col md:flex-row items-center gap-8 py-4">
          <RatioRadar data={radarData} size={220} />
          <div className="flex gap-6">
            {grouped.map(g => (
              <RatioScoreRing
                key={g.key}
                label={g.label}
                score={Math.round(groupStats[g.key]?.companyAvg ?? 50)}
                color={g.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ratio Groups with Bar Cards */}
      {grouped.map(g => (
        <div key={g.key} className="space-y-1">
          <div className="flex items-center gap-2 pb-2 border-b border-border/15">
            <span className="text-sm font-medium text-muted-foreground">{g.icon} {g.label}</span>
            <span className="text-xs text-muted-foreground/60">({g.ratios.length})</span>
          </div>
          {g.ratios.map(r => (
            <RatioBarCard
              key={r.key}
              label={r.label}
              companyValue={r.value}
              sectorMedian={r.sectorMedian}
              percentile={r.percentile}
              formattedValue={r.formattedValue}
              formattedMedian={formatValue(r.key, r.sectorMedian)}
              higherIsBetter={r.higherIsBetter}
            />
          ))}
        </div>
      ))}

      {/* AI Report */}
      <CeoFundamentalReport ticker={tickerUpper} />
    </div>
  )
}

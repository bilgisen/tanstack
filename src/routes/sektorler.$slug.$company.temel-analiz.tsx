import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { fetchCompanyData, type FundamentalData } from '../constants/companyShared'
import {
  Compass, TrendingUp, DollarSign, Shield,
  BarChart3,
} from 'lucide-react'
import { CeoFundamentalReport } from '../components/company/CeoFundamentalReport'

export const Route = createFileRoute('/sektorler/$slug/$company/temel-analiz')({
  component: FundamentalAnalysisPage,
})

interface RatioItem {
  key: string
  label: string
  value: number | null
  formattedValue: string
  sectorMedian: number | null
  percentile: number | null
  vsSector: string | null
  higherIsBetter: boolean
}

interface RatioGroup {
  title: string
  icon: React.ReactNode
  ratios: RatioItem[]
}

const RATIO_LABELS: Record<string, string> = {
  roe: 'Özkaynak Kârlılığı (ROE)',
  roa: 'Aktif Kârlılığı (ROA)',
  gross_margin: 'Brüt Kâr Marjı',
  net_margin: 'Net Kâr Marjı',
  operating_margin: 'Operasyonel Marj',
  ebitda_margin: 'FAVÖK Marjı',
  current_ratio: 'Cari Oran',
  acid_test_ratio: 'Asit Test Oranı',
  debt_to_equity: 'Borç / Özsermaye',
  debt_ratio: 'Borçlanma Oranı',
  net_debt_to_equity: 'Net Borç / Özsermaye',
  asset_turnover: 'Aktif Devir Hızı',
}

const RATIO_GROUPS: Record<string, { title: string; icon: React.ReactNode; higherIsBetter: boolean }> = {
  karlilik: {
    title: 'Kârlılık Rasyoları',
    icon: <TrendingUp size={14} className="text-emerald-500" />,
    higherIsBetter: true,
  },
  finansal: {
    title: 'Finansal Sağlık Rasyoları',
    icon: <Shield size={14} className="text-blue-500" />,
    higherIsBetter: false,
  },
  verimlilik: {
    title: 'Verimlilik Rasyoları',
    icon: <BarChart3 size={14} className="text-purple-500" />,
    higherIsBetter: true,
  },
}

const GROUP_ASSIGNMENT: Record<string, string> = {
  roe: 'karlilik',
  roa: 'karlilik',
  gross_margin: 'karlilik',
  net_margin: 'karlilik',
  operating_margin: 'karlilik',
  ebitda_margin: 'karlilik',
  current_ratio: 'finansal',
  acid_test_ratio: 'finansal',
  debt_to_equity: 'finansal',
  debt_ratio: 'finansal',
  net_debt_to_equity: 'finansal',
  asset_turnover: 'verimlilik',
}

function formatRatioValue(key: string, value: number | null): string {
  if (value === null) return '-'
  if (key === 'gross_margin' || key === 'net_margin' || key === 'operating_margin' || key === 'ebitda_margin' || key === 'roe' || key === 'roa') {
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
            if (res.ok) {
              const json = await res.json()
              return json.ratios || {}
            }
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
        const groupKey = GROUP_ASSIGNMENT[key]
        const group = RATIO_GROUPS[groupKey]
        if (!group) continue
        const sc = data.sector_comparison
        items.push({
          key,
          label,
          value: data.value ?? null,
          formattedValue: formatRatioValue(key, data.value ?? null),
          sectorMedian: sc?.sector_median ?? null,
          percentile: sc?.company_percentile ?? null,
          vsSector: sc?.vs_sector ?? null,
          higherIsBetter: group.higherIsBetter,
        })
      }

      setRatios(items)
      } catch (e) { console.error('fundamental data load failed', e) }
      setLoading(false)
    }

    load()
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const groupedRatios: RatioGroup[] = []
  for (const [groupKey, config] of Object.entries(RATIO_GROUPS)) {
    const groupRatios = ratios.filter(r => GROUP_ASSIGNMENT[r.key] === groupKey)
    if (groupRatios.length > 0) {
      groupedRatios.push({
        title: config.title,
        icon: config.icon,
        ratios: groupRatios,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* RASYOLAR */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Compass size={14} />
          </div>
          <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Rasyolar</h3>
        </div>

        {/* F/K Badge */}
        {fundamental && fundamental.fk !== '-' && (
          <div className="flex items-center gap-3 p-4 border border-border/40 rounded-xl bg-muted/10">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase">Fiyat / Kazanç (F/K)</span>
              <div className="text-xl font-black text-foreground">{fundamental.fk}</div>
            </div>
          </div>
        )}

        {/* Ratio Groups */}
        {groupedRatios.map((group) => (
          <div key={group.title} className="space-y-3">
            <div className="flex items-center gap-2">
              {group.icon}
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{group.title}</h4>
            </div>
            <div className="space-y-1">
              {group.ratios.map((ratio) => {
                const isAboveMedian = ratio.sectorMedian !== null && ratio.value !== null && (
                  ratio.higherIsBetter ? ratio.value > ratio.sectorMedian : ratio.value < ratio.sectorMedian
                )
                const percentile = ratio.percentile ?? 50
                return (
                  <div key={ratio.key} className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground block">{ratio.label}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {/* Company Value */}
                      <div className="text-right min-w-[60px]">
                        <span className="text-base font-black text-foreground font-mono">{ratio.formattedValue}</span>
                      </div>
                      {/* Sector Median */}
                      {ratio.sectorMedian !== null && (
                        <div className="text-right min-w-[80px]">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Sektör</span>
                          <span className="text-sm font-bold text-muted-foreground font-mono">{formatRatioValue(ratio.key, ratio.sectorMedian)}</span>
                        </div>
                      )}
                      {/* Percentile Bar */}
                      {ratio.percentile !== null && (
                        <div className="w-20 hidden md:block">
                          <div className="h-1.5 bg-muted/30 rounded-full relative">
                            <div
                              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                              style={{ width: `${percentile}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center block mt-0.5">%{percentile.toFixed(0)}</span>
                        </div>
                      )}
                      {/* Above/Below Badge */}
                      {ratio.vsSector && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${isAboveMedian ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {isAboveMedian ? 'Üstünde' : 'Altında'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AI TEMEL ANALIZ RAPORU */}
      <CeoFundamentalReport ticker={tickerUpper} />
    </div>
  )
}

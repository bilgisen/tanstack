import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import type { FundamentalData } from '../constants/companyShared'
import { CeoFundamentalReport } from '../components/company/CeoFundamentalReport'
import { useCompanyData, useCompanyRatios } from '../lib/useCompanyData'

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
  cost_income_ratio: 'Maliyet/Gelir',
  net_interest_margin: 'Net Faiz Marjı',
  loan_to_deposit: 'Kredi/Mevduat',
  npl_ratio: 'Takipteki Kredi',
  capital_adequacy: 'Sermaye Yeterlilik',
}

const GROUP_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  karlilik: { label: 'Kârlılık', color: '#10b981', icon: '📈' },
  finansal: { label: 'Finansal Sağlık', color: '#3b82f6', icon: '🛡️' },
  verimlilik: { label: 'Verimlilik', color: '#8b5cf6', icon: '⚡' },
}

const GROUP_ASSIGNMENT: Record<string, string> = {
  roe: 'karlilik', roa: 'karlilik', gross_margin: 'karlilik',
  net_margin: 'karlilik', operating_margin: 'karlilik', ebitda_margin: 'karlilik',
  cost_income_ratio: 'karlilik', net_interest_margin: 'karlilik',
  current_ratio: 'finansal', acid_test_ratio: 'finansal', debt_to_equity: 'finansal',
  debt_ratio: 'finansal', net_debt_to_equity: 'finansal',
  loan_to_deposit: 'finansal', npl_ratio: 'finansal', capital_adequacy: 'finansal',
  asset_turnover: 'verimlilik',
}

const RATIO_ORDER = ['karlilik', 'finansal', 'verimlilik']

function formatValue(key: string, value: number | null): string {
  if (value === null) return '-'
  if (['roe', 'roa', 'gross_margin', 'net_margin', 'operating_margin', 'ebitda_margin', 'net_interest_margin', 'cost_income_ratio', 'npl_ratio'].includes(key)) {
    return `%${(value * 100).toFixed(1)}`
  }
  return value.toFixed(2)
}

function FundamentalAnalysisPage() {
  const { company } = Route.useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/' })
    }
  }, [user, authLoading, navigate])

  if (authLoading || !user) return null

  const tickerUpper = company.toUpperCase()
  const { data: companyRaw, isLoading: loading1 } = useCompanyData(tickerUpper)
  const { data: ratiosRaw } = useCompanyRatios(tickerUpper)

  const fundamental: FundamentalData | null = companyRaw?.fundamental || null
  const ratiosResult = ratiosRaw?.ratios || {}
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
  const ratios = items
  const loading = loading1

  // Group ratios
  const grouped = (() => {
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
  })()

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

      {/* Ratio Groups */}
      {grouped.map(g => (
        <div key={g.key} className="space-y-1">
          <div className="flex items-center gap-2 pb-2 border-b border-border/15">
            <span className="text-sm font-medium text-muted-foreground">{g.icon} {g.label}</span>
            <span className="text-xs text-muted-foreground/60">({g.ratios.length})</span>
          </div>
          {g.ratios.map(r => {
            const pct = r.percentile ?? 50
            const isAbove = r.sectorMedian !== null && r.value !== null && (
              r.higherIsBetter ? r.value > r.sectorMedian : r.value < r.sectorMedian
            )
            return (
              <div key={r.key} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-foreground/80">{r.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold font-mono text-foreground">{r.formattedValue}</span>
                  {r.sectorMedian !== null && (
                    <span className="text-xs text-muted-foreground font-mono w-20 text-right">
                      {formatValue(r.key, r.sectorMedian)}
                    </span>
                  )}
                  {r.percentile !== null && (
                    <span className={`text-xs font-medium w-10 text-right ${pct > 60 ? 'text-emerald-500' : pct < 40 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      %{pct}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* AI Report */}
      <CeoFundamentalReport ticker={tickerUpper} />
    </div>
  )
}

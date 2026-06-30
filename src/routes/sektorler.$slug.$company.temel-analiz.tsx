import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LockedSection } from '../components/company/LockedSection'
import { fetchCompanyData, type FundamentalData } from '../constants/companyShared'
import {
  Compass, TrendingUp, DollarSign, Shield, AlertTriangle,
  Sparkles, TrendingDown, Lightbulb, BarChart3,
} from 'lucide-react'
import {
  useFundamentalAnalysis,
  type UserTier,
} from '../components/fundamental'
import { useAuth } from '../hooks/useAuth'
import { type Tier } from '../lib/tiers'

export const Route = createFileRoute('/sektorler/$slug/$company/temel-analiz')({
  component: FundamentalAnalysisPage,
})

function mapTierToFA(tier: Tier | null): UserTier {
  if (!tier) return 'anonymous'
  if (tier === 'ultimate' || tier === 'pro') return 'subscriber'
  if (tier === 'standard' || tier === 'free') return 'member'
  return 'anonymous'
}

function getUserTierFromAuth(user: any): UserTier {
  if (!user) return 'anonymous'
  const userTier = user.tier as Tier | null
  return mapTierToFA(userTier)
}

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

  const { user, loading: authLoading } = useAuth()
  const userTier = getUserTierFromAuth(user)

  const { data: aiData, loading: aiLoading } = useFundamentalAnalysis(
    tickerUpper,
    userTier,
    { authLoading }
  )

  useEffect(() => {
    let isMounted = true

    async function load() {
      const compUrl = import.meta.env.VITE_COMP_API_URL || 'https://comp-ef958063.fastapicloud.dev'

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
      setLoading(false)
    }

    load()
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  if (loading || authLoading) {
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

  const scoreCard = aiData?.cards?.find((c: any) => c.type === 'score_card')?.data
  const swotData = aiData?.detailed_report?.swot_analysis
  const detailedReport = aiData?.detailed_report

  return (
    <div className="space-y-8">
      {/* ANONYMOUS GATE */}
      {userTier === 'anonymous' && (
        <LockedSection
          variant="anonymous"
          title="İncelemek İçin Ücretsiz Bağlanın"
          description="Temel analiz rasyolarını, AI analizlerini ve SWOT raporlarını görüntülemek için giriş yapın."
          showFreeTrial
        >
          <div className="min-h-[300px]" />
        </LockedSection>
      )}

      {/* SECTION A: RASYOLAR (MEMBER-ONLY) */}
      {userTier !== 'anonymous' && (
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
      )}

      {/* SECTION B: PREMIUM ANALIZ (SUBSCRIBER-ONLY) */}
      <LockedSection variant="subscriber" title="Premium Temel Analiz" description="Şirket değerlendirmesi, SWOT analizi ve AI raporuna erişmek için yükseltme yapın.">
        <div className="space-y-6">

          {/* i. Company Rating */}
          {scoreCard && (
            <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Şirket Değerlendirmesi</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Main Score */}
                <div className="col-span-2 md:col-span-1 p-4 border border-border/40 rounded-xl bg-muted/10">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Toplam Puan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">{scoreCard.score_sektor?.toFixed(1) || '-'}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  {scoreCard.rank_sector && (
                    <div className="mt-2 text-xs text-muted-foreground">Sektör: #{scoreCard.rank_sector}</div>
                  )}
                </div>
                {/* Pillars */}
                {[
                  { key: 'score_karlilik', label: 'Kârlılık' },
                  { key: 'score_finansal', label: 'Finansal' },
                  { key: 'score_verimlilik', label: 'Verimlilik' },
                ].map((p) => {
                  const val = scoreCard[p.key]
                  return (
                    <div key={p.key} className="p-4 border border-border/40 rounded-xl bg-muted/10">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">{p.label}</span>
                      <div className="text-2xl font-black text-foreground">{val?.toFixed(0) || '-'}</div>
                      <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${val >= 70 ? 'bg-emerald-500' : val >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${val || 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ii. SWOT Analizi */}
          {swotData && (
            <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-border/30 border-b">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Compass size={14} />
                </div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider">SWOT Analizi</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <h4 className="text-sm font-bold text-emerald-600">Güçlü Yönler</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotData.strengths || []).slice(0, 4).map((item: any, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                        <span>{item.item || item.point || item.title}</span>
                      </li>
                    ))}
                    {(!swotData.strengths || swotData.strengths.length === 0) && (
                      <li className="text-sm text-muted-foreground italic">Veri yetersiz</li>
                    )}
                  </ul>
                </div>
                {/* Weaknesses */}
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={16} className="text-red-500" />
                    <h4 className="text-sm font-bold text-red-600">Zayıf Yönler</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotData.weaknesses || []).slice(0, 4).map((item: any, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5 shrink-0">•</span>
                        <span>{item.item || item.point || item.title}</span>
                      </li>
                    ))}
                    {(!swotData.weaknesses || swotData.weaknesses.length === 0) && (
                      <li className="text-sm text-muted-foreground italic">Veri yetersiz</li>
                    )}
                  </ul>
                </div>
                {/* Opportunities */}
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={16} className="text-blue-500" />
                    <h4 className="text-sm font-bold text-blue-600">Fırsatlar</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotData.opportunities || []).slice(0, 4).map((item: any, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                        <span>{item.item || item.point || item.title}</span>
                      </li>
                    ))}
                    {(!swotData.opportunities || swotData.opportunities.length === 0) && (
                      <li className="text-sm text-muted-foreground italic">Veri yetersiz</li>
                    )}
                  </ul>
                </div>
                {/* Threats */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <h4 className="text-sm font-bold text-amber-600">Tehditler</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotData.threats || []).slice(0, 4).map((item: any, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                        <span>{item.item || item.point || item.title}</span>
                      </li>
                    ))}
                    {(!swotData.threats || swotData.threats.length === 0) && (
                      <li className="text-sm text-muted-foreground italic">Veri yetersiz</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* iii. Yapay Zeka Temel Analiz Raporu */}
          {detailedReport && (
            <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Yapay Zeka Temel Analiz Raporu</h3>
              </div>

              {/* Executive Summary */}
              {detailedReport.executive_summary && (
                <div className="p-4 border border-primary/20 rounded-xl bg-primary/5">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} /> Yönetici Özeti
                  </span>
                  <p className="text-sm text-foreground/80 font-medium leading-relaxed">{detailedReport.executive_summary}</p>
                </div>
              )}

              {/* Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailedReport.financial_position && (
                  <div className="p-4 border border-border/40 rounded-xl bg-muted/10">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <BarChart3 size={12} /> Finansal Durum
                    </span>
                    <p className="text-sm text-foreground/70 leading-relaxed">{detailedReport.financial_position}</p>
                  </div>
                )}
                {detailedReport.profitability_analysis && (
                  <div className="p-4 border border-border/40 rounded-xl bg-muted/10">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <TrendingUp size={12} /> Kârlılık Analizi
                    </span>
                    <p className="text-sm text-foreground/70 leading-relaxed">{detailedReport.profitability_analysis}</p>
                  </div>
                )}
                {detailedReport.balance_sheet_analysis && (
                  <div className="p-4 border border-border/40 rounded-xl bg-muted/10">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Bilânço Analizi</span>
                    <p className="text-sm text-foreground/70 leading-relaxed">{detailedReport.balance_sheet_analysis}</p>
                  </div>
                )}
                {detailedReport.sector_comparison && (
                  <div className="p-4 border border-border/40 rounded-xl bg-muted/10">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Sektör Karşılaştırması</span>
                    <p className="text-sm text-foreground/70 leading-relaxed">{detailedReport.sector_comparison}</p>
                  </div>
                )}
              </div>

              {/* Catalysts & Risks */}
              {(detailedReport.catalysts?.length > 0 || detailedReport.risks?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailedReport.catalysts?.length > 0 && (
                    <div className="p-4 border border-emerald-500/20 rounded-xl bg-emerald-500/5">
                      <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <TrendingUp size={12} /> Katalizörler
                      </span>
                      <ul className="space-y-1">
                        {detailedReport.catalysts.slice(0, 4).map((c: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {detailedReport.risks?.length > 0 && (
                    <div className="p-4 border border-red-500/20 rounded-xl bg-red-500/5">
                      <span className="text-xs text-red-500 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={12} /> Riskler
                      </span>
                      <ul className="space-y-1">
                        {detailedReport.risks.slice(0, 4).map((r: string, i: number) => (
                          <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                            <span className="text-red-500 mt-0.5 shrink-0">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Conclusion */}
              {detailedReport.conclusion && (
                <div className="p-4 border border-border/40 rounded-xl bg-muted/10">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Sonuç</span>
                  <p className="text-sm text-foreground/80 leading-relaxed">{detailedReport.conclusion}</p>
                </div>
              )}

              {/* Disclaimer */}
              {detailedReport.disclaimer && (
                <p className="text-[10px] text-muted-foreground italic">{detailedReport.disclaimer}</p>
              )}
            </div>
          )}

          {/* Upgrade CTA */}
          <div className="border border-primary/20 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 md:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Premium Analiz ile Yatırım Kararlarınızı Güçlendirin</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                SWOT analizi, AI destekli detaylı rapor, sektör karşılaştırması ve daha fazlası.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary" /> SWOT Analizi</span>
              <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary" /> AI Rapor</span>
              <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary" /> Detaylı Rasyolar</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
              <span>🎁 7 Gün Ücretsiz Deneme</span>
            </div>
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer">
              Pro'ya Yükselt — 7 Gün Ücretsiz Dene
            </button>
          </div>

        </div>
      </LockedSection>
    </div>
  )
}

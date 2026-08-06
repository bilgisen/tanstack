import { createFileRoute } from '@tanstack/react-router'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { BarChart3, Building2, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { useCompFundamentals } from '../lib/useCompData'
import { ScoreGauge } from '../constants/companyShared'
import { getRatioDef } from '../constants/ratios'
import { SafeTooltip } from '../components/ui/typed-tooltip'

export const Route = createFileRoute('/hisse/$ticker/temel-analiz')({
  component: FundamentalAnalysisPage,
})

const ABSOLUTE_LABEL_COLORS: Record<string, string> = {
  GÜÇLÜ: 'text-emerald-500', SAĞLIKLI: 'text-emerald-400',
  ORTA: 'text-yellow-500', ZAYIF: 'text-orange-500', KRİTİK: 'text-red-500',
}
const ABSOLUTE_LABEL_BG: Record<string, string> = {
  GÜÇLÜ: 'bg-emerald-500/10', SAĞLIKLI: 'bg-emerald-400/10',
  ORTA: 'bg-yellow-500/10', ZAYIF: 'bg-orange-500/10', KRİTİK: 'bg-red-500/10',
}

function AbsoluteBadge({ label }: { label: string }) {
  const color = ABSOLUTE_LABEL_COLORS[label] || 'text-muted-foreground'
  const bg = ABSOLUTE_LABEL_BG[label] || 'bg-muted/20'
  return <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 ${bg} ${color}`}>{label}</span>
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

const TREND_COLORS = ['var(--primary)', '#22c55e', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6']

function FundamentalAnalysisPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const { data, isLoading } = useCompFundamentals(tickerUpper, 'abone')

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-48 w-full bg-muted/20 animate-pulse rounded-2xl" />
        <div className="h-32 w-full bg-muted/20 animate-pulse rounded-2xl" />
        <div className="h-64 w-full bg-muted/20 animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield size={40} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-sm font-bold text-foreground mb-1">Veri Bulunamadı</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          {tickerUpper} için temel analiz verisi henüz hesaplanmamış. Skor hesaplama süreci 5-10 dakika sürebilir.
        </p>
      </div>
    )
  }

  const pillarLabels: Record<string, string> = {
    finansal_saglik: 'Finansal Sağlık', karlilik_buyume: 'Karlılık & Büyüme', degerleme: 'Değerleme',
  }
  const pillarKeys = data.pillars ? Object.entries(data.pillars) : []
  const pillarChartData = pillarKeys.map(([key, p]) => ({
    name: pillarLabels[key] || key, score: Math.round(p.score),
  }))

  const ratioEntries = Object.entries(data.ratios || {})
  const ratioChartData = ratioEntries.map(([code, r]) => {
    const def = getRatioDef(code)
    return {
      name: def?.label || r.name || code,
      value: r.value ?? 0,
      sectorValue: r.sector_context?.median,
    }
  })

  const trendData = data.trends?.trends ? Object.entries(data.trends.trends).slice(0, 4) : []
  const trendPeriods: Array<string> = []
  const trendSeries: Array<{ name: string; data: Record<string, number | null>; color: string }> = []
  trendData.forEach(([code, t], idx: number) => {
    if (!t.values) return
    const series: Record<string, number | null> = {}
    t.values.forEach((v: { period: string; value: number }) => {
      if (!trendPeriods.includes(v.period)) trendPeriods.push(v.period)
      series[v.period] = v.value
    })
    trendSeries.push({ name: code, data: series, color: TREND_COLORS[idx % TREND_COLORS.length] })
  })
  trendPeriods.sort()
  const trendChartData = trendPeriods.map((period) => {
    const point: Record<string, any> = { period: period.slice(0, 7) }
    trendSeries.forEach((s) => { point[s.name] = s.data[period] ?? null })
    return point
  })

  return (
    <div className="space-y-6">

      {/* ═══ SCORE + PILLARS ═══ */}
      {data.composite_score != null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Shield size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Temel Analiz Puanı</h3>
              {data.reliability && <span className="text-[10px] text-muted-foreground ml-auto">{data.reliability}</span>}
            </div>

            <div className="flex items-center gap-5">
              <ScoreGauge score={Math.round(data.composite_score)} size={80} />
              <div className="space-y-1">
                <div className="text-base font-bold text-foreground">{data.company_name || tickerUpper}</div>
                {data.sector && <div className="text-xs text-muted-foreground">{data.sector}</div>}
                {data.absolute && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono font-semibold text-foreground">{fmt(data.absolute.score)}</span>
                    <AbsoluteBadge label={data.absolute.label} />
                  </div>
                )}
                <div className="flex items-center gap-4 pt-1">
                  {data.percentile != null && (
                    <div className="text-xs text-muted-foreground">
                      <span className="text-[10px] font-medium uppercase tracking-wider">Piyasa </span>
                      <span className="text-sm font-bold text-foreground">%{fmt(data.percentile, 0)}</span>
                    </div>
                  )}
                  {data.ranks?.sector && (
                    <div className="text-xs text-muted-foreground">
                      <span className="text-[10px] font-medium uppercase tracking-wider">Sektör </span>
                      <span className="text-sm font-bold text-foreground">%{fmt(data.ranks.sector.percentile, 0)}</span>
                      <span className="text-[10px] ml-1">({data.ranks.sector.n_peers} şirket)</span>
                    </div>
                  )}
                  {data.ranks?.group && (
                    <div className="text-xs text-muted-foreground">
                      <span className="text-[10px] font-medium uppercase tracking-wider">Grup </span>
                      <span className="text-sm font-bold text-foreground">%{fmt(data.ranks.group.percentile, 0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {pillarChartData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <BarChart3 size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Bileşen Skorları</h3>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pillarChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <SafeTooltip
                      formatter={(val) => `${val}`}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[3, 3, 0, 0]} maxBarSize={40}>
                      {pillarChartData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#22c55e' : i === 1 ? '#494fdf' : '#f59e0b'} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ PROFILE + RATIOS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.profile && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Building2 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Şirket Profili</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {data.profile.sector_main && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sektör</div><div className="font-semibold text-foreground mt-0.5">{data.profile.sector_main}</div></div>
              )}
              {data.profile.industry && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Endüstri</div><div className="font-semibold text-foreground mt-0.5">{data.profile.industry}</div></div>
              )}
              {data.profile.financial_group_label && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Finansal Grup</div><div className="font-semibold text-foreground mt-0.5">{data.profile.financial_group_label}</div></div>
              )}
              {data.profile.market_cap != null && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Piyasa Değeri</div><div className="font-semibold text-foreground mt-0.5">₺{fmt(data.profile.market_cap, 0)}</div></div>
              )}
            </div>
          </div>
        )}

        {ratioChartData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <BarChart3 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Temel Rasyolar</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">Şirket · Sektör Medyan</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratioChartData} layout="vertical" margin={{ top: 0, right: 40, left: 110, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={105} />
                    <SafeTooltip
                      formatter={(val) => fmt(typeof val === 'number' ? val : Number(val))}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                    />
                  <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)' }} />
                  <Bar dataKey="value" name="Şirket" radius={[0, 3, 3, 0]} maxBarSize={10} fill="var(--primary)" fillOpacity={0.8} />
                  {ratioChartData.some(r => r.sectorValue != null) && (
                    <Bar dataKey="sectorValue" name="Sektör Medyan" radius={[0, 3, 3, 0]} maxBarSize={10} fill="#22c55e" fillOpacity={0.6} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ═══ TRENDS LINE CHART ═══ */}
      {trendChartData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/20">
            <TrendingUp size={14} className="text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Rasyo Trendleri</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <SafeTooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)' }} />
                {trendSeries.map((s) => (
                  <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={1.5} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ KEY INSIGHTS (Öne Çıkanlar) ═══ */}
      {data.key_insights?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/20">
            <Sparkles size={14} className="text-amber-500" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Öne Çıkanlar</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.key_insights.map((insight, i) => {
              const catColor: Record<string, string> = {
                strength: 'border-l-emerald-500 bg-emerald-500/5',
                weakness: 'border-l-red-500 bg-red-500/5',
                positive_trend: 'border-l-blue-500 bg-blue-500/5',
                negative_trend: 'border-l-orange-500 bg-orange-500/5',
                data_quality: 'border-l-gray-500 bg-gray-500/5',
              }
              const barColor = catColor[insight.category] || 'border-l-muted bg-muted/5'
              return (
                <div key={i} className={`border-l-2 pl-3 py-1.5 ${barColor}`}>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{insight.category === 'strength' ? 'Güçlü Yön' : insight.category === 'weakness' ? 'Zayıf Yön' : insight.category === 'positive_trend' ? 'Olumlu Trend' : insight.category === 'negative_trend' ? 'Olumsuz Trend' : 'Veri'}</span>
                  <p className="text-xs text-foreground mt-0.5">{insight.insight}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      
    </div>
  )
}

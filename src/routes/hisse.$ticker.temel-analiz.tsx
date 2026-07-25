import { createFileRoute } from '@tanstack/react-router'
import { useCompScore, useCompProfile, useCompRatios, useCompTrends } from '../lib/useCompData'
import { FaReport } from '../components/company/FaReport'
import { ScoreGauge } from '../constants/companyShared'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, Shield, Building2, BarChart3, Sparkles } from 'lucide-react'

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

  const { data: scoreData, isLoading: scoreLoading } = useCompScore(tickerUpper)
  const { data: profileData, isLoading: profileLoading } = useCompProfile(tickerUpper)
  const { data: ratiosData, isLoading: ratiosLoading } = useCompRatios(tickerUpper)
  const { data: trendsData } = useCompTrends(tickerUpper)
  const loading = scoreLoading || profileLoading || ratiosLoading

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-48 w-full bg-muted/20 animate-pulse" />
        <div className="h-32 w-full bg-muted/20 animate-pulse" />
        <div className="h-64 w-full bg-muted/20 animate-pulse" />
      </div>
    )
  }

  const score = (scoreData as any) || null
  const profile = (profileData as any) || null
  const ratios = (ratiosData as any) || null
  const trends = (trendsData as any) || null

  const pillarLabels: Record<string, string> = {
    finansal_saglik: 'Finansal Sağlık', karlilik_buyume: 'Karlılık & Büyüme', degerleme: 'Değerleme',
  }
  const pillarKeys = score?.pillars ? Object.entries(score.pillars) : []
  const pillarChartData = pillarKeys.map(([key, p]: [string, any]) => ({
    name: pillarLabels[key] || key, score: Math.round(p.score),
  }))

  const ratiosList = ratios?.ratios || []
  const ratioChartData = ratiosList.slice(0, 10).map((r: any) => ({
    name: r.name || r.code, value: r.value,
    sectorValue: r.sector_context?.median,
  }))

  const trendData = trends?.trends ? Object.entries(trends.trends).slice(0, 4) : []
  const trendPeriods: string[] = []
  const trendSeries: { name: string; data: Record<string, number | null>; color: string }[] = []
  trendData.forEach(([code, t]: [string, any], idx: number) => {
    const series: Record<string, number | null> = {}
    t.values.forEach((v: any) => {
      if (!trendPeriods.includes(v.period)) trendPeriods.push(v.period)
      series[v.period] = v.value
    })
    trendSeries.push({ name: t.name || code, data: series, color: TREND_COLORS[idx % TREND_COLORS.length] })
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
      {score && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Shield size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Temel Analiz Puanı</h3>
              {score.reliability && <span className="text-[10px] text-muted-foreground ml-auto">{score.reliability}</span>}
            </div>

            <div className="flex items-center gap-5">
              <ScoreGauge score={Math.round(score.composite_score)} size={80} />
              <div className="space-y-1">
                <div className="text-base font-bold text-foreground">{score.company_name || tickerUpper}</div>
                {score.sector && <div className="text-xs text-muted-foreground">{score.sector}</div>}
                {score.absolute && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono font-semibold text-foreground">{fmt(score.absolute.score)}</span>
                    <AbsoluteBadge label={score.absolute.label} />
                  </div>
                )}
                <div className="flex items-center gap-4 pt-1">
                  {score.ranks?.sector && (
                    <div className="text-xs text-muted-foreground">
                      <span className="text-[10px] font-medium uppercase tracking-wider">Sektör </span>
                      <span className="text-sm font-bold text-foreground">%{fmt(score.ranks.sector.percentile, 0)}</span>
                      <span className="text-[10px] ml-1">({score.ranks.sector.n_peers} şirket)</span>
                    </div>
                  )}
                  {score.ranks?.group && (
                    <div className="text-xs text-muted-foreground">
                      <span className="text-[10px] font-medium uppercase tracking-wider">Grup </span>
                      <span className="text-sm font-bold text-foreground">%{fmt(score.ranks.group.percentile, 0)}</span>
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
                    <Tooltip
                      formatter={(val: any) => `${val}`}
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
        {profile && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/20">
              <Building2 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Şirket Profili</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {profile.sector_main && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sektör</div><div className="font-semibold text-foreground mt-0.5">{profile.sector_main}</div></div>
              )}
              {profile.industry && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Endüstri</div><div className="font-semibold text-foreground mt-0.5">{profile.industry}</div></div>
              )}
              {profile.financial_group_label && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Finansal Grup</div><div className="font-semibold text-foreground mt-0.5">{profile.financial_group_label}</div></div>
              )}
              {profile.market_data?.market_cap && (
                <div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Piyasa Değeri</div><div className="font-semibold text-foreground mt-0.5">₺{fmt(profile.market_data.market_cap, 0)}</div></div>
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
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratioChartData.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 40, left: 90, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={85} />
                    <Tooltip
                      formatter={(val: any) => fmt(val)}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                    />
                  <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)' }} />
                  <Bar dataKey="value" name="Şirket" radius={[0, 3, 3, 0]} maxBarSize={10} fill="var(--primary)" fillOpacity={0.8} />
                  {ratioChartData.some((r: any) => r.sectorValue != null) && (
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
                <Tooltip
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

      {/* ═══ AI FA REPORT ═══ */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-border/20">
          <Sparkles size={14} className="text-violet-500" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Temel Analiz</h3>
        </div>
        <FaReport ticker={ticker} />
      </div>
    </div>
  )
}

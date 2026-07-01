import { useEffect, useState } from 'react'
import {
  AlertTriangle, TrendingUp, TrendingDown, Shield, BarChart3,
  ChevronDown, ChevronUp, Sparkles, Lightbulb, Eye, Activity,
} from 'lucide-react'

interface FundamentalReport {
  ticker: string
  company_name: string
  sector: string
  period_key: string
  executive_summary: string
  financial_health: {
    status: string
    status_text: string
    metrics: Array<{
      metric: string
      value: number | null
      sector_median: number | null
      diff_pct: number
      interpretation: string
    }>
  }
  profitability: {
    assessment: string
    karlilik_score: number | null
    metrics: Array<{
      metric: string
      value: string
      raw_value: number | null
      sector_median: number | null
      percentile: number | null
      diff_pct: number
      interpretation: string
    }>
  }
  sector_comparison: {
    summary: string
    rank: number | null
    total: number | null
    percentile: number | null
    above_count: number
    below_count: number
    above_ratios: string[]
    below_ratios: string[]
  }
  swot: {
    strengths: Array<{ item: string; impact: string; source: string }>
    weaknesses: Array<{ item: string; impact: string; source: string }>
    opportunities: Array<{ item: string; impact: string; source: string }>
    threats: Array<{ item: string; impact: string; source: string }>
  }
  scenarios: {
    optimistic: {
      title: string
      probability: string
      factors: string[]
      outcome: string
    }
    pessimistic: {
      title: string
      probability: string
      factors: string[]
      outcome: string
    }
  }
  watchlist: Array<{
    metric: string
    status: string
    note: string
  }>
  computed_at: string
  disclaimer: string
}

interface CeoFundamentalReportProps {
  ticker: string
}

export function CeoFundamentalReport({ ticker }: CeoFundamentalReportProps) {
  const [report, setReport] = useState<FundamentalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('summary')

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      setError(false)
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
        const res = await fetch(`${apiUrl}/api/market/symbol/${ticker.toUpperCase()}/fundamental-report`)
        if (res.ok) {
          const data = await res.json()
          if (!data.error) {
            setReport(data)
          } else {
            setError(true)
          }
        } else {
          setError(true)
        }
      } catch (e) {
        console.error('Fundamental report fetch error:', e)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [ticker])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-destructive'
  }

  const getHealthColor = (status: string) => {
    if (status === 'strong') return 'text-emerald-500'
    if (status === 'caution') return 'text-amber-500'
    return 'text-muted-foreground'
  }

  const getImpactBadge = (impact: string) => {
    if (impact === 'high') return 'bg-emerald-500/10 text-emerald-500'
    if (impact === 'medium') return 'bg-yellow-500/10 text-yellow-500'
    return 'bg-muted/30 text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="border border-border/45 bg-card/20 rounded-2xl p-6 text-center">
        <AlertTriangle className="mx-auto mb-3 text-muted-foreground" size={24} />
        <p className="text-sm text-muted-foreground">AI temel analiz raporu şu an için yüklenemiyor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Report Header */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">AI Temel Analiz Raporu</h3>
              <span className="text-sm text-muted-foreground">{report.company_name} ({report.ticker}) — {report.period_key}</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Yönetici Özeti</span>
          </div>
          <p className="text-base text-foreground/90 leading-relaxed font-medium">
            {report.executive_summary}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
            <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Sektör</span>
            <span className="text-base font-bold text-foreground">{report.sector}</span>
          </div>
          <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
            <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Sıralama</span>
            <span className="text-base font-bold text-foreground">
              {report.sector_comparison.rank}/{report.sector_comparison.total}
            </span>
          </div>
          <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
            <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Kârlılık</span>
            <span className={`text-xl font-bold font-mono ${getScoreColor(report.profitability.karlilik_score || 0)}`}>
              {report.profitability.karlilik_score?.toFixed(1) || '-'}/100
            </span>
          </div>
          <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
            <span className="text-sm text-muted-foreground font-semibold uppercase block mb-1">Finansal Durum</span>
            <span className={`text-base font-bold ${getHealthColor(report.financial_health.status)}`}>
              {report.financial_health.status === 'strong' ? 'Güçlü' :
               report.financial_health.status === 'caution' ? 'Dikkat' : 'Nötr'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
        <button
          onClick={() => toggleSection('health')}
          className="w-full flex items-center justify-between pb-4 border-b border-border/30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Shield size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Finansal Sağlık</h3>
          </div>
          {expandedSection === 'health' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'health' && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-foreground/80 font-medium">{report.financial_health.status_text}</p>
            {report.financial_health.metrics.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{m.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-foreground">
                      {m.value?.toFixed(2) || '-'}
                    </span>
                    {m.sector_median !== null && (
                      <span className="text-xs text-muted-foreground">
                        (Sektör: {m.sector_median.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/70">{m.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profitability */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
        <button
          onClick={() => toggleSection('profitability')}
          className="w-full flex items-center justify-between pb-4 border-b border-border/30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Kârlılık Analizi</h3>
          </div>
          {expandedSection === 'profitability' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'profitability' && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-foreground/80 font-medium">{report.profitability.assessment}</p>
            {report.profitability.metrics.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{m.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-foreground">{m.value}</span>
                    {m.percentile !== null && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        m.percentile > 60 ? 'bg-emerald-500/10 text-emerald-500' :
                        m.percentile < 40 ? 'bg-red-500/10 text-red-500' :
                        'bg-muted/30 text-muted-foreground'
                      }`}>
                        %{m.percentile}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/70">{m.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sector Comparison */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
        <button
          onClick={() => toggleSection('sector')}
          className="w-full flex items-center justify-between pb-4 border-b border-border/30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <BarChart3 size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Sektör Karşılaştırması</h3>
          </div>
          {expandedSection === 'sector' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'sector' && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-foreground/80 font-medium">{report.sector_comparison.summary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-sm font-bold text-emerald-500 uppercase block mb-1">Sektör Üstünde</span>
                <span className="text-2xl font-black text-foreground">{report.sector_comparison.above_count}</span>
              </div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <span className="text-sm font-bold text-red-500 uppercase block mb-1">Sektör Altında</span>
                <span className="text-2xl font-black text-foreground">{report.sector_comparison.below_count}</span>
              </div>
            </div>
            {report.sector_comparison.above_ratios.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-xs text-emerald-500 font-bold uppercase block mb-1">Güçlü Olduğu Alanlar</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.sector_comparison.above_ratios.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {report.sector_comparison.below_ratios.length > 0 && (
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <span className="text-xs text-red-500 font-bold uppercase block mb-1">Zayıf Olduğu Alanlar</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.sector_comparison.below_ratios.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-semibold">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SWOT */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
        <button
          onClick={() => toggleSection('swot')}
          className="w-full flex items-center justify-between pb-4 border-b border-border/30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Activity size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">SWOT Analizi</h3>
          </div>
          {expandedSection === 'swot' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'swot' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-emerald-500" />
                <h4 className="text-sm font-bold text-emerald-600">Güçlü Yönler</h4>
              </div>
              <ul className="space-y-2">
                {report.swot.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                    <div>
                      <span>{item.item}</span>
                      <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${getImpactBadge(item.impact)}`}>
                        {item.impact}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Weaknesses */}
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-red-500" />
                <h4 className="text-sm font-bold text-red-600">Zayıf Yönler</h4>
              </div>
              <ul className="space-y-2">
                {report.swot.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5 shrink-0">•</span>
                    <div>
                      <span>{item.item}</span>
                      <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${getImpactBadge(item.impact)}`}>
                        {item.impact}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Opportunities */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-blue-500" />
                <h4 className="text-sm font-bold text-blue-600">Fırsatlar</h4>
              </div>
              <ul className="space-y-2">
                {report.swot.opportunities.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                    <div>
                      <span>{item.item}</span>
                      <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${getImpactBadge(item.impact)}`}>
                        {item.impact}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Threats */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                <h4 className="text-sm font-bold text-amber-600">Tehditler</h4>
              </div>
              <ul className="space-y-2">
                {report.swot.threats.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    <div>
                      <span>{item.item}</span>
                      <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${getImpactBadge(item.impact)}`}>
                        {item.impact}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Scenarios */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
        <button
          onClick={() => toggleSection('scenarios')}
          className="w-full flex items-center justify-between pb-4 border-b border-border/30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Lightbulb size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Senaryo Analizi</h3>
          </div>
          {expandedSection === 'scenarios' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'scenarios' && (
          <div className="mt-4 space-y-3">
            {/* Optimistic */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-emerald-500 uppercase">{report.scenarios.optimistic.title}</span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  Olasılık: {report.scenarios.optimistic.probability}
                </span>
              </div>
              <ul className="space-y-1 mb-2">
                {report.scenarios.optimistic.factors.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>{f}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-bold text-emerald-500">{report.scenarios.optimistic.outcome}</span>
            </div>

            {/* Pessimistic */}
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-destructive uppercase">{report.scenarios.pessimistic.title}</span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                  Olasılık: {report.scenarios.pessimistic.probability}
                </span>
              </div>
              <ul className="space-y-1 mb-2">
                {report.scenarios.pessimistic.factors.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>{f}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-bold text-destructive">{report.scenarios.pessimistic.outcome}</span>
            </div>
          </div>
        )}
      </div>

      {/* Watchlist */}
      <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
        <button
          onClick={() => toggleSection('watchlist')}
          className="w-full flex items-center justify-between pb-4 border-b border-border/30"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Eye size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">İzleme Listesi</h3>
          </div>
          {expandedSection === 'watchlist' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'watchlist' && (
          <div className="mt-4 space-y-2">
            {report.watchlist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/30">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  item.status === 'risk' ? 'bg-red-500' : 'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-foreground block">{item.metric}</span>
                  <span className="text-sm text-muted-foreground">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/5 border border-border/20">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <Shield size={12} className="inline mr-1" />
          {report.disclaimer}
        </p>
      </div>

    </div>
  )
}

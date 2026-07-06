import { useEffect, useState } from 'react'
import {
  AlertTriangle, TrendingUp, TrendingDown, Shield, BarChart3,
  ChevronDown, ChevronUp,
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
  scenarios: {
    optimistic: { title: string; probability: string; factors: string[]; outcome: string }
    pessimistic: { title: string; probability: string; factors: string[]; outcome: string }
  }
  watchlist: Array<{ metric: string; status: string; note: string }>
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      setError(false)
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.jetborsa.com"
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

  const SectionHeader = ({ icon, label, section }: { icon: React.ReactNode; label: string; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-3 border-b border-border/20"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 className="text-base font-semibold text-foreground">{label}</h3>
      </div>
      {expandedSection === section ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
    </button>
  )

  return (
    <div className="space-y-0">

      {/* Executive Summary — no card */}
      <p className="text-lg text-foreground/85 leading-relaxed py-1">
        {report.executive_summary}
      </p>

      {/* Quick Stats — inline */}
      <div className="grid grid-cols-3 gap-3 py-4">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Sıralama</span>
          <span className="text-base font-medium text-foreground">
            {report.sector_comparison.rank}/{report.sector_comparison.total}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Kârlılık</span>
          <span className={`text-xl font-semibold font-mono ${getScoreColor(report.profitability.karlilik_score || 0)}`}>
            {report.profitability.karlilik_score?.toFixed(1) || '-'}/100
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Finansal Durum</span>
          <span className={`text-base font-medium ${getHealthColor(report.financial_health.status)}`}>
            {report.financial_health.status === 'strong' ? 'Güçlü' :
             report.financial_health.status === 'caution' ? 'Dikkat' : 'Nötr'}
          </span>
        </div>
      </div>

      {/* Financial Health */}
      <div>
        <SectionHeader
          icon={<Shield size={14} className="text-blue-500" />}
          label="Finansal Sağlık"
          section="health"
        />
        {expandedSection === 'health' && (
          <div className="pt-4 pb-2 space-y-3">
            <p className="text-sm text-foreground/70">{report.financial_health.status_text}</p>
            {report.financial_health.metrics.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{m.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold font-mono text-foreground">
                      {m.value?.toFixed(2) || '-'}
                    </span>
                    {m.sector_median !== null && (
                      <span className="text-xs text-muted-foreground">
                        (Sektör: {m.sector_median.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/60">{m.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profitability */}
      <div>
        <SectionHeader
          icon={<TrendingUp size={14} className="text-emerald-500" />}
          label="Kârlılık Analizi"
          section="profitability"
        />
        {expandedSection === 'profitability' && (
          <div className="pt-4 pb-2 space-y-3">
            <p className="text-sm text-foreground/70">{report.profitability.assessment}</p>
            {report.profitability.metrics.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{m.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold font-mono text-foreground">{m.value}</span>
                    {m.percentile !== null && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        m.percentile > 60 ? 'bg-emerald-500/10 text-emerald-500' :
                        m.percentile < 40 ? 'bg-red-500/10 text-red-500' :
                        'bg-muted/30 text-muted-foreground'
                      }`}>
                        %{m.percentile}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/60">{m.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sector Comparison */}
      <div>
        <SectionHeader
          icon={<BarChart3 size={14} className="text-violet-500" />}
          label="Sektör Karşılaştırması"
          section="sector"
        />
        {expandedSection === 'sector' && (
          <div className="pt-4 pb-2 space-y-3">
            <p className="text-sm text-foreground/70">{report.sector_comparison.summary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-500 uppercase block mb-1">Sektör Üstünde</span>
                <span className="text-2xl font-bold text-foreground">{report.sector_comparison.above_count}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-red-500 uppercase block mb-1">Sektör Altında</span>
                <span className="text-2xl font-bold text-foreground">{report.sector_comparison.below_count}</span>
              </div>
            </div>
            {report.sector_comparison.above_ratios.length > 0 && (
              <div>
                <span className="text-xs text-emerald-500 font-semibold uppercase block mb-1">Güçlü Alanlar</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.sector_comparison.above_ratios.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {report.sector_comparison.below_ratios.length > 0 && (
              <div>
                <span className="text-xs text-red-500 font-semibold uppercase block mb-1">Zayıf Alanlar</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.sector_comparison.below_ratios.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scenarios */}
      <div>
        <SectionHeader
          icon={<TrendingDown size={14} className="text-cyan-500" />}
          label="Senaryo Analizi"
          section="scenarios"
        />
        {expandedSection === 'scenarios' && (
          <div className="pt-4 pb-2 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-500 uppercase">{report.scenarios.optimistic.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  Olasılık: {report.scenarios.optimistic.probability}
                </span>
              </div>
              <ul className="space-y-1">
                {report.scenarios.optimistic.factors.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>{f}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-semibold text-emerald-500">{report.scenarios.optimistic.outcome}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-destructive uppercase">{report.scenarios.pessimistic.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  Olasılık: {report.scenarios.pessimistic.probability}
                </span>
              </div>
              <ul className="space-y-1">
                {report.scenarios.pessimistic.factors.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>{f}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-semibold text-destructive">{report.scenarios.pessimistic.outcome}</span>
            </div>
          </div>
        )}
      </div>

      {/* Watchlist */}
      <div>
        <SectionHeader
          icon={<AlertTriangle size={14} className="text-amber-500" />}
          label="İzleme Listesi"
          section="watchlist"
        />
        {expandedSection === 'watchlist' && (
          <div className="pt-4 pb-2 space-y-2">
            {report.watchlist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  item.status === 'risk' ? 'bg-red-500' : 'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{item.metric}</span>
                  <span className="text-sm text-muted-foreground ml-2">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="pt-4 border-t border-border/15">
        <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
          {report.disclaimer}
        </p>
      </div>

    </div>
  )
}

import { useEffect, useState } from 'react'
import {
  AlertTriangle, Target, Shield, Activity, BarChart3, Eye,
  ChevronDown, ChevronUp, Zap, Sparkles
} from 'lucide-react'

interface CeoReport {
  ticker: string
  report_date: string
  current_price: number
  executive_summary: string
  overview: {
    technical_score: number
    confidence: string
    short_term_trend: string
    medium_term_trend: string
    long_term_trend: string
    price_character: string
    market_regime: string
    trend_direction: string
    recommended_strategy: string
  }
  key_levels: {
    support_1: { price: number; importance: string; scenario: string }
    support_2: { price: number; importance: string; scenario: string }
    resistance_1: { price: number; importance: string; scenario: string }
    resistance_2: { price: number; importance: string; scenario: string }
    stop_loss: number
    take_profit: number
    risk_reward_ratio: number
  }
  indicators: {
    rsi: { value: number; interpretation: string; status: string }
    macd: { macd_line: number; signal_line: number; histogram: number; interpretation: string }
    moving_averages: {
      sma_20: number; sma_50: number; sma_200: number
      price_vs_sma20: string; price_vs_sma50: string; price_vs_sma200: string
      golden_cross: boolean
    }
    volatility: { atr: number; atr_percent: number; bollinger_upper: number; bollinger_lower: number }
    volume: { obv_trend: string; mfi: number }
  }
  scenarios: {
    positive: { name: string; conditions: string[]; target: string; probability: string }
    neutral: { name: string; conditions: string[]; strategy: string; probability: string }
    negative: { name: string; conditions: string[]; risk: string; probability: string }
  }
  volume_profile: { poc: number; value_area_high: number; value_area_low: number; interpretation: string }
  watchlist: { daily: string[]; weekly: string[] }
  disclaimer: string
}

interface CeoTaReportProps {
  ticker: string
  unit?: string
}

export function CeoTaReport({ ticker, unit = 'TL' }: CeoTaReportProps) {
  const [report, setReport] = useState<CeoReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [reportUnit, setReportUnit] = useState(unit)

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      setError(false)
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.jetborsa.com"
        const res = await fetch(`${apiUrl}/api/market/symbol/${ticker.toUpperCase()}/ta/ceo-report`)
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setReport(data)
            // Use unit from API response if available, otherwise use prop
            if (data.unit) {
              setReportUnit(data.unit)
            }
          } else {
            setError(true)
          }
        } else {
          setError(true)
        }
      } catch (e) {
        console.error('CEO report fetch error:', e)
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

  const formatPrice = (price: number) => {
    if (reportUnit === 'puan') {
      return `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} puan`
    }
    return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-destructive'
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

  if (error || !report || !report.overview) {
    return (
      <div className="border border-border/45 bg-card/20 rounded-2xl p-6 text-center">
        <AlertTriangle className="mx-auto mb-3 text-muted-foreground" size={24} />
        <p className="text-sm text-muted-foreground">AI teknik analiz raporu şu an için yüklenemiyor.</p>
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

      {/* Executive Summary — no card, just text */}
      <p className="text-lg text-foreground/85 leading-relaxed py-1">
        {report.executive_summary}
      </p>

      {/* Quick Stats — inline, no card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Teknik Skor</span>
          <span className={`text-xl font-semibold font-mono ${getScoreColor(report.overview.technical_score)}`}>
            {report.overview.technical_score}/100
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Piyasa Rejimi</span>
          <span className="text-base font-medium text-foreground">{report.overview.market_regime}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Fiyat Karakteri</span>
          <span className="text-base font-medium text-foreground">{report.overview.price_character}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Risk/Ödül</span>
          <span className="text-xl font-semibold font-mono text-foreground">{report.key_levels.risk_reward_ratio}</span>
        </div>
      </div>

      {/* Key Levels */}
      <div>
        <SectionHeader
          icon={<Target size={14} className="text-amber-500" />}
          label="Kritik Fiyat Seviyeleri"
          section="levels"
        />
        {expandedSection === 'levels' && (
          <div className="pt-4 pb-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Destekler</span>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{report.key_levels.support_1.importance}</span>
                  <span className="text-sm font-semibold font-mono text-emerald-500">{formatPrice(report.key_levels.support_1.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{report.key_levels.support_1.scenario}</p>
                <div className="flex justify-between items-center pt-2 border-t border-border/10">
                  <span className="text-sm text-muted-foreground">{report.key_levels.support_2.importance}</span>
                  <span className="text-sm font-semibold font-mono text-emerald-500">{formatPrice(report.key_levels.support_2.price)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Dirençler</span>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{report.key_levels.resistance_1.importance}</span>
                  <span className="text-sm font-semibold font-mono text-destructive">{formatPrice(report.key_levels.resistance_1.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{report.key_levels.resistance_1.scenario}</p>
                <div className="flex justify-between items-center pt-2 border-t border-border/10">
                  <span className="text-sm text-muted-foreground">{report.key_levels.resistance_2.importance}</span>
                  <span className="text-sm font-semibold font-mono text-destructive">{formatPrice(report.key_levels.resistance_2.price)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Stop-Loss</span>
                <span className="text-sm font-semibold font-mono text-destructive">{formatPrice(report.key_levels.stop_loss)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Hedef</span>
                <span className="text-sm font-semibold font-mono text-emerald-500">{formatPrice(report.key_levels.take_profit)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">R/R Oranı</span>
                <span className="text-sm font-semibold font-mono text-foreground">{report.key_levels.risk_reward_ratio}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicators */}
      <div>
        <SectionHeader
          icon={<Activity size={14} className="text-blue-500" />}
          label="Gösterge Yorumları"
          section="indicators"
        />
        {expandedSection === 'indicators' && (
          <div className="pt-4 pb-2 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground uppercase">RSI (14)</span>
                <span className={`text-base font-semibold font-mono ${
                  report.indicators.rsi.value > 70 ? 'text-destructive' :
                  report.indicators.rsi.value < 30 ? 'text-emerald-500' : 'text-foreground'
                }`}>{report.indicators.rsi.value}</span>
              </div>
              <p className="text-sm text-foreground/70">{report.indicators.rsi.interpretation}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground uppercase">MACD</span>
                <span className={`text-base font-semibold font-mono ${
                  report.indicators.macd.histogram > 0 ? 'text-emerald-500' : 'text-destructive'
                }`}>{report.indicators.macd.histogram > 0 ? 'Pozitif' : 'Negatif'}</span>
              </div>
              <p className="text-sm text-foreground/70">{report.indicators.macd.interpretation}</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground uppercase">Hareketli Ortalamalar</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block">SMA 20</span>
                  <span className="text-sm font-semibold font-mono">{formatPrice(report.indicators.moving_averages.sma_20)}</span>
                  <span className={`text-xs block ${report.indicators.moving_averages.price_vs_sma20 === 'Üstünde' ? 'text-emerald-500' : 'text-destructive'}`}>
                    {report.indicators.moving_averages.price_vs_sma20}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block">SMA 50</span>
                  <span className="text-sm font-semibold font-mono">{formatPrice(report.indicators.moving_averages.sma_50)}</span>
                  <span className={`text-xs block ${report.indicators.moving_averages.price_vs_sma50 === 'Üstünde' ? 'text-emerald-500' : 'text-destructive'}`}>
                    {report.indicators.moving_averages.price_vs_sma50}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block">SMA 200</span>
                  <span className="text-sm font-semibold font-mono">{formatPrice(report.indicators.moving_averages.sma_200)}</span>
                  <span className={`text-xs block ${report.indicators.moving_averages.price_vs_sma200 === 'Üstünde' ? 'text-emerald-500' : 'text-destructive'}`}>
                    {report.indicators.moving_averages.price_vs_sma200}
                  </span>
                </div>
              </div>
              {report.indicators.moving_averages.golden_cross && (
                <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
                  <span className="text-sm font-semibold text-emerald-500">Golden Cross Aktif</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-sm text-muted-foreground uppercase">Volatilite</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground">ATR</span>
                  <span className="text-sm font-semibold font-mono block">{formatPrice(report.indicators.volatility.atr)}</span>
                  <span className="text-xs text-muted-foreground">%{report.indicators.volatility.atr_percent}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Bollinger</span>
                  <span className="text-sm font-mono block">{formatPrice(report.indicators.volatility.bollinger_lower)} - {formatPrice(report.indicators.volatility.bollinger_upper)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scenarios */}
      <div>
        <SectionHeader
          icon={<Zap size={14} className="text-violet-500" />}
          label="Senaryo Analizi"
          section="scenarios"
        />
        {expandedSection === 'scenarios' && (
          <div className="pt-4 pb-2 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-500 uppercase">{report.scenarios.positive.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Olasılık: {report.scenarios.positive.probability}</span>
              </div>
              <ul className="space-y-1">
                {report.scenarios.positive.conditions.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-semibold text-emerald-500">{report.scenarios.positive.target}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground uppercase">{report.scenarios.neutral.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground">Olasılık: {report.scenarios.neutral.probability}</span>
              </div>
              <ul className="space-y-1">
                {report.scenarios.neutral.conditions.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
              <span className="text-sm text-muted-foreground">{report.scenarios.neutral.strategy}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-destructive uppercase">{report.scenarios.negative.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Olasılık: {report.scenarios.negative.probability}</span>
              </div>
              <ul className="space-y-1">
                {report.scenarios.negative.conditions.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-semibold text-destructive">{report.scenarios.negative.risk}</span>
            </div>
          </div>
        )}
      </div>

      {/* Watchlist */}
      <div>
        <SectionHeader
          icon={<BarChart3 size={14} className="text-cyan-500" />}
          label="İzleme Listesi"
          section="watchlist"
        />
        {expandedSection === 'watchlist' && (
          <div className="pt-4 pb-2 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Günlük Takip</span>
              <ul className="space-y-1">
                {report.watchlist.daily.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-cyan-500">☑</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Haftalık Takip</span>
              <ul className="space-y-1">
                {report.watchlist.weekly.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-cyan-500">☑</span>{item}
                  </li>
                ))}
              </ul>
            </div>
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

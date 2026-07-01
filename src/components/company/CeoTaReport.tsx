import { useEffect, useState } from 'react'
import { 
  FileText, AlertTriangle, 
  Target, Shield, Activity, BarChart3, Eye, ChevronDown, ChevronUp,
  Zap, Lock, Sparkles
} from 'lucide-react'
import { LockedSection } from '../company/LockedSection'

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
}

export function CeoTaReport({ ticker }: CeoTaReportProps) {
  const [report, setReport] = useState<CeoReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('summary')

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      setError(false)
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
        const res = await fetch(`${apiUrl}/api/market/symbol/${ticker.toUpperCase()}/ta/ceo-report`)
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

  const formatPrice = (price: number) => `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

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

  if (error || !report) {
    return (
      <div className="border border-border/45 bg-card/20 rounded-2xl p-6 text-center">
        <AlertTriangle className="mx-auto mb-3 text-muted-foreground" size={24} />
        <p className="text-sm text-muted-foreground">CEO raporu şu an için yüklenemiyor.</p>
      </div>
    )
  }

  return (
    <LockedSection variant="subscriber" title="Premium Teknik Analiz Raporu" description="CEO / Yönetim Kurulu seviyesinde profesyonel teknik analiz raporu.">
      <div className="space-y-4">
        
        {/* Report Header */}
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{report.ticker} Teknik Analiz Raporu</h3>
                <span className="text-xs text-muted-foreground">{report.report_date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-muted-foreground" />
              <Sparkles size={14} className="text-primary" />
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Yönetici Özeti</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              {report.executive_summary}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Teknik Skor</span>
              <span className={`text-lg font-bold font-mono ${getScoreColor(report.overview.technical_score)}`}>
                {report.overview.technical_score}/100
              </span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Piyasa Rejimi</span>
              <span className="text-sm font-bold text-foreground">{report.overview.market_regime}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Fiyat Karakteri</span>
              <span className="text-sm font-bold text-foreground">{report.overview.price_character}</span>
            </div>
            <div className="p-3 border border-border/40 rounded-xl bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Risk/Ödül</span>
              <span className="text-lg font-bold font-mono text-foreground">{report.key_levels.risk_reward_ratio}</span>
            </div>
          </div>
        </div>

        {/* Key Levels */}
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
          <button 
            onClick={() => toggleSection('levels')}
            className="w-full flex items-center justify-between pb-4 border-b border-border/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Target size={14} />
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Kritik Fiyat Seviyeleri</h3>
            </div>
            {expandedSection === 'levels' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSection === 'levels' && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Supports */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block mb-3">Destek Seviyeleri</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{report.key_levels.support_1.importance}</span>
                      <span className="text-sm font-bold font-mono text-emerald-500">{formatPrice(report.key_levels.support_1.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.key_levels.support_1.scenario}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-emerald-500/10">
                      <span className="text-sm text-muted-foreground">{report.key_levels.support_2.importance}</span>
                      <span className="text-sm font-bold font-mono text-emerald-500">{formatPrice(report.key_levels.support_2.price)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Resistances */}
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <span className="text-xs font-bold text-destructive uppercase tracking-wider block mb-3">Direnç Seviyeleri</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{report.key_levels.resistance_1.importance}</span>
                      <span className="text-sm font-bold font-mono text-destructive">{formatPrice(report.key_levels.resistance_1.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.key_levels.resistance_1.scenario}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-destructive/10">
                      <span className="text-sm text-muted-foreground">{report.key_levels.resistance_2.importance}</span>
                      <span className="text-sm font-bold font-mono text-destructive">{formatPrice(report.key_levels.resistance_2.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stop Loss / Take Profit */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border border-border/40 rounded-xl bg-muted/10 text-center">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Stop-Loss</span>
                  <span className="text-sm font-bold font-mono text-destructive">{formatPrice(report.key_levels.stop_loss)}</span>
                </div>
                <div className="p-3 border border-border/40 rounded-xl bg-muted/10 text-center">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Hedef</span>
                  <span className="text-sm font-bold font-mono text-emerald-500">{formatPrice(report.key_levels.take_profit)}</span>
                </div>
                <div className="p-3 border border-border/40 rounded-xl bg-muted/10 text-center">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">R/R Oranı</span>
                  <span className="text-sm font-bold font-mono text-foreground">{report.key_levels.risk_reward_ratio}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Indicators Interpretation */}
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
          <button 
            onClick={() => toggleSection('indicators')}
            className="w-full flex items-center justify-between pb-4 border-b border-border/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Activity size={14} />
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Gösterge Yorumları</h3>
            </div>
            {expandedSection === 'indicators' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSection === 'indicators' && (
            <div className="mt-4 space-y-4">
              {/* RSI */}
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">RSI (14)</span>
                  <span className={`text-sm font-bold font-mono ${
                    report.indicators.rsi.value > 70 ? 'text-destructive' : 
                    report.indicators.rsi.value < 30 ? 'text-emerald-500' : 'text-foreground'
                  }`}>{report.indicators.rsi.value}</span>
                </div>
                <p className="text-sm text-foreground/80">{report.indicators.rsi.interpretation}</p>
              </div>
              
              {/* MACD */}
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">MACD</span>
                  <span className={`text-sm font-bold font-mono ${
                    report.indicators.macd.histogram > 0 ? 'text-emerald-500' : 'text-destructive'
                  }`}>{report.indicators.macd.histogram > 0 ? 'Pozitif' : 'Negatif'}</span>
                </div>
                <p className="text-sm text-foreground/80">{report.indicators.macd.interpretation}</p>
              </div>
              
              {/* Moving Averages */}
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <span className="text-xs font-bold text-muted-foreground uppercase block mb-3">Hareketli Ortalamalar</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground block">SMA 20</span>
                    <span className="text-sm font-bold font-mono">{formatPrice(report.indicators.moving_averages.sma_20)}</span>
                    <span className={`text-[10px] block ${report.indicators.moving_averages.price_vs_sma20 === 'Üstünde' ? 'text-emerald-500' : 'text-destructive'}`}>
                      {report.indicators.moving_averages.price_vs_sma20}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground block">SMA 50</span>
                    <span className="text-sm font-bold font-mono">{formatPrice(report.indicators.moving_averages.sma_50)}</span>
                    <span className={`text-[10px] block ${report.indicators.moving_averages.price_vs_sma50 === 'Üstünde' ? 'text-emerald-500' : 'text-destructive'}`}>
                      {report.indicators.moving_averages.price_vs_sma50}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground block">SMA 200</span>
                    <span className="text-sm font-bold font-mono">{formatPrice(report.indicators.moving_averages.sma_200)}</span>
                    <span className={`text-[10px] block ${report.indicators.moving_averages.price_vs_sma200 === 'Üstünde' ? 'text-emerald-500' : 'text-destructive'}`}>
                      {report.indicators.moving_averages.price_vs_sma200}
                    </span>
                  </div>
                </div>
                {report.indicators.moving_averages.golden_cross && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 text-center">
                    <span className="text-xs font-bold text-emerald-500">Golden Cross Aktif</span>
                  </div>
                )}
              </div>
              
              {/* Volatility */}
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <span className="text-xs font-bold text-muted-foreground uppercase block mb-2">Volatilite</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground">ATR</span>
                    <span className="text-sm font-bold font-mono block">{formatPrice(report.indicators.volatility.atr)}</span>
                    <span className="text-[10px] text-muted-foreground">%{report.indicators.volatility.atr_percent}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Bollinger</span>
                    <span className="text-xs font-mono block">{formatPrice(report.indicators.volatility.bollinger_lower)} - {formatPrice(report.indicators.volatility.bollinger_upper)}</span>
                  </div>
                </div>
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
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <Zap size={14} />
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Senaryo Analizi</h3>
            </div>
            {expandedSection === 'scenarios' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSection === 'scenarios' && (
            <div className="mt-4 space-y-3">
              {/* Positive */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-500 uppercase">{report.scenarios.positive.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">Olasılık: {report.scenarios.positive.probability}</span>
                </div>
                <ul className="space-y-1 mb-2">
                  {report.scenarios.positive.conditions.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>{c}
                    </li>
                  ))}
                </ul>
                <span className="text-xs font-bold text-emerald-500">{report.scenarios.positive.target}</span>
              </div>
              
              {/* Neutral */}
              <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{report.scenarios.neutral.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground">Olasılık: {report.scenarios.neutral.probability}</span>
                </div>
                <ul className="space-y-1 mb-2">
                  {report.scenarios.neutral.conditions.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>{c}
                    </li>
                  ))}
                </ul>
                <span className="text-xs text-muted-foreground">{report.scenarios.neutral.strategy}</span>
              </div>
              
              {/* Negative */}
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-destructive uppercase">{report.scenarios.negative.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Olasılık: {report.scenarios.negative.probability}</span>
                </div>
                <ul className="space-y-1 mb-2">
                  {report.scenarios.negative.conditions.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>{c}
                    </li>
                  ))}
                </ul>
                <span className="text-xs font-bold text-destructive">{report.scenarios.negative.risk}</span>
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
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <BarChart3 size={14} />
              </div>
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">İzleme Listesi</h3>
            </div>
            {expandedSection === 'watchlist' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSection === 'watchlist' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase block mb-2">Günlük Takip</span>
                <ul className="space-y-1">
                  {report.watchlist.daily.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-cyan-500">☑</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase block mb-2">Haftalık Takip</span>
                <ul className="space-y-1">
                  {report.watchlist.weekly.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-cyan-500">☑</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-muted/5 border border-border/20">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <Shield size={10} className="inline mr-1" />
            {report.disclaimer}
          </p>
        </div>

      </div>
    </LockedSection>
  )
}

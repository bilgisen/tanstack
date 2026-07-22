import { useEffect, useState } from 'react'
import {
  AlertTriangle, Target, Shield, Activity, BarChart3,
  Zap, Sparkles, TrendingUp, Gauge, Coins, LineChart, Clock
} from 'lucide-react'

interface CeoTaReportProps {
  ticker: string
  unit?: string
}

interface ScoreBarProps {
  label: string
  value: number
  max: number
  color: string
}

function ScoreBar({ label, value, max, color }: ScoreBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-foreground font-semibold">{Math.round(value)}/{max}</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ProbabilityBadge({ prob }: { prob: string }) {
  const colorMap: Record<string, string> = {
    'Yüksek': 'bg-emerald-500/15 text-emerald-500',
    'Orta': 'bg-yellow-500/15 text-yellow-500',
    'Düşük': 'bg-destructive/15 text-destructive',
  }
  const dotMap: Record<string, string> = {
    'Yüksek': 'bg-emerald-500',
    'Orta': 'bg-yellow-500',
    'Düşük': 'bg-destructive',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${colorMap[prob] || 'bg-muted/30 text-muted-foreground'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[prob] || 'bg-muted-foreground'}`} />
      {prob}
    </span>
  )
}

export function CeoTaReport({ ticker, unit = 'TL' }: CeoTaReportProps) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reportUnit, setReportUnit] = useState(unit)

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`/api/market/symbol/${ticker.toUpperCase()}/ta/ceo-report`)
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            setReport(data)
            if (data.unit) setReportUnit(data.unit)
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

  const fmt = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) return '—'
    const opts = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    if (reportUnit === 'puan') return `${price.toLocaleString('tr-TR', opts)} puan`
    return `₺${price.toLocaleString('tr-TR', opts)}`
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

  const o = report.overview
  const k = report.key_levels
  const ind = report.indicators
  const sc = report.scenarios

  return (
    <div className="space-y-6">

      {/* Executive Summary */}
      <div className="space-y-4">
        <p className="text-base text-foreground/85 leading-relaxed">
          {report.executive_summary}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card/40 border border-border/20 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Teknik Skor</span>
            <span className={`text-2xl font-bold font-mono ${getScoreColor(o.technical_score)}`}>
              {o.technical_score}/100
            </span>
            <span className="text-xs text-muted-foreground block mt-0.5">{o.confidence} güven</span>
          </div>
          <div className="bg-card/40 border border-border/20 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Piyasa Rejimi</span>
            <span className="text-base font-bold text-foreground block">{o.market_regime}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">{o.trend_direction}</span>
          </div>
          <div className="bg-card/40 border border-border/20 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Fiyat Karakteri</span>
            <span className="text-base font-bold text-foreground block">{o.price_character}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">{o.volatility_regime || ''}</span>
          </div>
          <div className="bg-card/40 border border-border/20 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase block mb-1">Risk/Ödül</span>
            <span className="text-2xl font-bold font-mono text-foreground block">{k.risk_reward_ratio}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">Stop: {fmt(k.stop_loss)}</span>
          </div>
        </div>
      </div>

      {/* Score Components */}
      {o.score_components && (
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Gauge size={14} className="text-primary" />
            Skor Bileşenleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <ScoreBar label="Trend" value={o.score_components.trend || 0} max={50} color="bg-emerald-500" />
            <ScoreBar label="Momentum" value={o.score_components.momentum || 0} max={30} color="bg-blue-500" />
            <ScoreBar label="Hacim" value={o.score_components.volume || 0} max={20} color="bg-amber-500" />
            <ScoreBar label="Formasyon" value={o.score_components.pattern || 0} max={100} color="bg-violet-500" />
          </div>
        </div>
      )}

      {/* Key Levels */}
      <div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Target size={14} className="text-amber-500" />
          Kritik Fiyat Seviyeleri
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-card/30 border border-border/15 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Shield size={14} className="text-emerald-500" />
              <div>
                <span className="text-sm text-muted-foreground">{k.support_1.importance}</span>
                <p className="text-xs text-muted-foreground/70">{k.support_1.scenario}</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-emerald-500">{fmt(k.support_1.price)}</span>
          </div>
          <div className="flex items-center justify-between bg-card/30 border border-border/15 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Shield size={14} className="text-emerald-500 opacity-60" />
              <div>
                <span className="text-sm text-muted-foreground">{k.support_2.importance}</span>
                <p className="text-xs text-muted-foreground/70">{k.support_2.scenario}</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-emerald-500">{fmt(k.support_2.price)}</span>
          </div>
          <div className="border-t border-border/10 my-1" />
          <div className="flex items-center justify-between bg-card/30 border border-border/15 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={14} className="text-destructive" />
              <div>
                <span className="text-sm text-muted-foreground">{k.resistance_1.importance}</span>
                <p className="text-xs text-muted-foreground/70">{k.resistance_1.scenario}</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-destructive">{fmt(k.resistance_1.price)}</span>
          </div>
          <div className="flex items-center justify-between bg-card/30 border border-border/15 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={14} className="text-destructive opacity-60" />
              <div>
                <span className="text-sm text-muted-foreground">{k.resistance_2.importance}</span>
                <p className="text-xs text-muted-foreground/70">{k.resistance_2.scenario}</p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-destructive">{fmt(k.resistance_2.price)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-card/40 border border-border/20 rounded-xl p-3 text-center">
            <span className="text-xs text-muted-foreground uppercase block mb-1">Stop-Loss</span>
            <span className="text-base font-bold font-mono text-destructive">{fmt(k.stop_loss)}</span>
          </div>
          <div className="bg-card/40 border border-border/20 rounded-xl p-3 text-center">
            <span className="text-xs text-muted-foreground uppercase block mb-1">Hedef</span>
            <span className="text-base font-bold font-mono text-emerald-500">{fmt(k.take_profit)}</span>
          </div>
          <div className="bg-card/40 border border-border/20 rounded-xl p-3 text-center">
            <span className="text-xs text-muted-foreground uppercase block mb-1">R/R Oranı</span>
            <span className="text-base font-bold font-mono text-foreground">{k.risk_reward_ratio}</span>
          </div>
        </div>
      </div>

      {/* Momentum & Indicators */}
      <div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={14} className="text-blue-500" />
          Momentum ve Göstergeler
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase">RSI (14)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold font-mono ${ind.rsi.value > 70 ? 'text-destructive' : ind.rsi.value < 30 ? 'text-emerald-500' : 'text-foreground'}`}>
                {ind.rsi.value}
              </span>
              <span className="text-xs text-muted-foreground">{ind.rsi.status}</span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1">{ind.rsi.interpretation}</p>
          </div>

          <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase">MACD</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold font-mono ${ind.macd.histogram > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                {ind.macd.histogram > 0 ? 'Pozitif' : 'Negatif'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1.5 text-xs text-muted-foreground">
              <span>MACD: {ind.macd.macd_line.toFixed(2)}</span>
              <span>Sinyal: {ind.macd.signal_line.toFixed(2)}</span>
              <span>Hist: {ind.macd.histogram.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1">{ind.macd.interpretation}</p>
          </div>

          {ind.stochastic && (
            <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
              <span className="text-xs text-muted-foreground font-medium uppercase">Stokastik</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-xl font-bold font-mono ${ind.stochastic.k > 80 ? 'text-destructive' : ind.stochastic.k < 20 ? 'text-emerald-500' : 'text-foreground'}`}>
                  {ind.stochastic.k.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">%K</span>
                <span className="text-base font-mono text-muted-foreground">{ind.stochastic.d.toFixed(1)} %D</span>
              </div>
              <span className="text-xs text-muted-foreground">{ind.stochastic.status}</span>
            </div>
          )}

          {ind.supertrend && (
            <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
              <span className="text-xs text-muted-foreground font-medium uppercase">Supertrend</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-lg font-bold font-mono ${ind.supertrend.direction === 'Yükseliş' ? 'text-emerald-500' : 'text-destructive'}`}>
                  {ind.supertrend.direction}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground block">{fmt(ind.supertrend.value)}</span>
            </div>
          )}

          {ind.adx_details && (
            <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
              <span className="text-xs text-muted-foreground font-medium uppercase">ADX</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-xl font-bold font-mono ${ind.adx_details.adx >= 25 ? 'text-emerald-500' : 'text-foreground'}`}>
                  {ind.adx_details.adx.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Etkinlik: {ind.adx_details.efficiency_ratio.toFixed(2)}</span>
            </div>
          )}

          {ind.vwap != null && (
            <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
              <span className="text-xs text-muted-foreground font-medium uppercase">VWAP</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-lg font-bold font-mono ${report.current_price >= ind.vwap ? 'text-emerald-500' : 'text-destructive'}`}>
                  {fmt(ind.vwap)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Fiyat {report.current_price >= ind.vwap ? 'üstünde' : 'altında'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Moving Averages */}
      <div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-cyan-500" />
          Hareketli Ortalamalar
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/15">
                <th className="text-left py-2 text-muted-foreground font-medium">Ortalama</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Değer</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Fiyata Göre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {[
                { label: 'SMA 20', value: ind.moving_averages.sma_20, cmp: ind.moving_averages.price_vs_sma20 },
                { label: 'SMA 50', value: ind.moving_averages.sma_50, cmp: ind.moving_averages.price_vs_sma50 },
                { label: 'SMA 200', value: ind.moving_averages.sma_200, cmp: ind.moving_averages.price_vs_sma200 },
                { label: 'EMA 9', value: ind.moving_averages.ema_9, cmp: ind.moving_averages.price_vs_ema9 },
                { label: 'EMA 21', value: ind.moving_averages.ema_21, cmp: ind.moving_averages.price_vs_ema21 },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="py-2 text-muted-foreground">{row.label}</td>
                  <td className="py-2 text-right font-mono font-semibold">{fmt(row.value)}</td>
                  <td className={`py-2 text-right font-semibold ${row.cmp === 'Üstünde' ? 'text-emerald-500' : 'text-destructive'}`}>{row.cmp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ind.moving_averages.golden_cross && (
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-sm font-bold text-emerald-500">Golden Cross (SMA 50 &gt; SMA 200) — Orta vadeli alış sinyali</span>
          </div>
        )}
      </div>

      {/* Volatility & Volume */}
      <div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-amber-500" />
          Volatilite ve Hacim
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase block">ATR</span>
            <span className="text-lg font-bold font-mono text-foreground">{fmt(ind.volatility.atr)}</span>
            <span className="text-xs text-muted-foreground block">%{ind.volatility.atr_percent}</span>
          </div>
          <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase block">Bollinger</span>
            <span className="text-sm font-mono text-muted-foreground block">
              Alt: {fmt(ind.volatility.bollinger_lower)}
            </span>
            <span className="text-sm font-mono text-muted-foreground block">
              Üst: {fmt(ind.volatility.bollinger_upper)}
            </span>
          </div>
          <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
            <span className="text-xs text-muted-foreground font-medium uppercase block">MFI</span>
            <span className={`text-lg font-bold font-mono ${ind.volume.mfi > 80 ? 'text-destructive' : ind.volume.mfi < 20 ? 'text-emerald-500' : 'text-foreground'}`}>
              {ind.volume.mfi.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground block">{ind.volume.obv_trend} (OBV)</span>
          </div>
          {report.volume_profile && (
            <div className="bg-card/30 border border-border/15 rounded-xl p-3.5">
              <span className="text-xs text-muted-foreground font-medium uppercase block">POC</span>
              <span className="text-lg font-bold font-mono text-foreground">{fmt(report.volume_profile.poc)}</span>
              <span className="text-xs text-muted-foreground block">
                VA: {fmt(report.volume_profile.value_area_low)} - {fmt(report.volume_profile.value_area_high)}
              </span>
            </div>
          )}
        </div>
        {report.volume_profile?.interpretation && (
          <p className="text-sm text-muted-foreground/70 mt-2">{report.volume_profile.interpretation}</p>
        )}
      </div>

      {/* Patterns */}
      {(report.patterns?.candlestick?.length > 0 || report.patterns?.chart?.length > 0) && (
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-violet-500" />
            Formasyonlar ({report.patterns.active_count} aktif)
          </h3>
          <div className="space-y-3">
            {report.patterns.candlestick?.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Mum Formasyonları</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.patterns.candlestick.slice(0, 6).map((p: any, i: number) => (
                    <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.direction === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : p.direction === 'Bearish' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-muted/20 border-border/20 text-muted-foreground'}`}>
                      {p.name} ({p.reliability})
                    </span>
                  ))}
                </div>
              </div>
            )}
            {report.patterns.chart?.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Teknik Formasyonlar</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.patterns.chart.slice(0, 4).map((p: any, i: number) => (
                    <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.direction === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : p.direction === 'Bearish' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-muted/20 border-border/20 text-muted-foreground'}`}>
                      {p.name} (güv:{p.confidence})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scenarios */}
      <div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap size={14} className="text-amber-500" />
          Senaryo Analizi
        </h3>
        <div className="space-y-3">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-500 uppercase">{sc.positive.name}</span>
              <ProbabilityBadge prob={sc.positive.probability} />
            </div>
            <ul className="space-y-1.5">
              {sc.positive.conditions.map((c: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">→</span>{c}
                </li>
              ))}
            </ul>
            <div className="pt-1.5 border-t border-emerald-500/10">
              <span className="text-sm font-bold text-emerald-500">{sc.positive.target}</span>
            </div>
          </div>

          <div className="bg-card/40 border border-border/20 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground uppercase">{sc.neutral.name}</span>
              <ProbabilityBadge prob={sc.neutral.probability} />
            </div>
            <ul className="space-y-1.5">
              {sc.neutral.conditions.map((c: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5 shrink-0">→</span>{c}
                </li>
              ))}
            </ul>
            <div className="pt-1.5 border-t border-border/10">
              <span className="text-xs text-muted-foreground">{sc.neutral.strategy}</span>
            </div>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-destructive uppercase">{sc.negative.name}</span>
              <ProbabilityBadge prob={sc.negative.probability} />
            </div>
            <ul className="space-y-1.5">
              {sc.negative.conditions.map((c: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5 shrink-0">→</span>{c}
                </li>
              ))}
            </ul>
            <div className="pt-1.5 border-t border-destructive/10">
              <span className="text-sm font-bold text-destructive">{sc.negative.risk}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Izlenmesi Gerekenler */}
      {report.izlenmesi_gerekenler && (
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <LineChart size={14} className="text-cyan-500" />
            İzlenmesi Gerekenler
          </h3>
          <div className="bg-card/30 border border-border/15 rounded-xl p-4 space-y-3">
            <p className="text-sm text-foreground/80 leading-relaxed">
              {report.izlenmesi_gerekenler.not}
            </p>
            {report.izlenmesi_gerekenler.kritik_seviyeler?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Kritik Seviyeler</span>
                <ul className="space-y-1">
                  {report.izlenmesi_gerekenler.kritik_seviyeler.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5 shrink-0">▸</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.izlenmesi_gerekenler.izlenecek_konular?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">İzlenecek Konular</span>
                <ul className="space-y-1">
                  {report.izlenmesi_gerekenler.izlenecek_konular.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5 shrink-0">▸</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Sonuç - Action Tips */}
      {report.ai_analysis?.sonuc?.length > 0 && (
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap size={14} className="text-emerald-500" />
            Sonuç & Aksiyon İpuçları
          </h3>
          <ul className="space-y-3">
            {report.ai_analysis.sonuc.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-foreground/85 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border/15 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-primary" />
          <span>JetBorsa AI tarafından hazırlanmıştır</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} />
          <span>Rapor oluşturulma tarihi: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

    </div>
  )
}

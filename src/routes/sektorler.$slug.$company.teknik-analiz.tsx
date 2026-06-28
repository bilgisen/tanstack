import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { LockedSection } from '../components/company/LockedSection'
import { fetchCompanyData, ScoreGauge, SignalBadge, type CompanyStats, type TaData } from '../constants/companyShared'
import {
  Activity, TrendingUp, BarChart3, Target, AlertTriangle,
  CandlestickChart, Shield, Zap, Gauge, LineChart, HelpCircle, Sparkles, Lock,
} from 'lucide-react'
import { useChatStore } from '../store/chat'

export const Route = createFileRoute('/sektorler/$slug/$company/teknik-analiz')({
  component: TechnicalAnalysisPage,
})

function TechnicalAnalysisPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [taData, setTaData] = useState<TaData>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useChatStore()

  const chatContext = `sirket:${tickerUpper}`

  const technicalQuestions = [
    `${tickerUpper} için destek ve direnç noktalarını özetler misin?`,
    `${tickerUpper} RSI ve MACD teknik sinyalleri ne yönde?`,
    `${tickerUpper} güncel hareketli ortalama durumu nedir?`,
    `${tickerUpper} Bollinger Bandı konumu nasıl?`,
    `${tickerUpper} ATR bazlı stop-loss seviyesi kaç olmalıdır?`,
  ]

  useEffect(() => {
    let isMounted = true
    fetchCompanyData(tickerUpper, slug).then((data: any) => {
      if (isMounted) {
        setStats(data.stats)
        setTaData(data.taData)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-[360px] w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* PUBLIC: Chart */}
      <TradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {/* PUBLIC: Essential TA Data */}
      {taData && (
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Activity size={14} />
              </div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Teknik Analiz</h3>
            </div>
            <ScoreGauge score={taData.score} />
          </div>

          {/* Trend Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Günlük Trend', value: taData.trend, icon: <TrendingUp size={13} />, bull: taData.trend.toLowerCase().includes('bull') || taData.trend.toLowerCase().includes('yükseliş') },
              { label: 'ADX Trend Gücü', value: taData.market_regime.adx.toString(), icon: <LineChart size={13} />, bull: taData.market_regime.adx >= 25 ? true : null },
              { label: 'Piyasa Rejimi', value: taData.market_regime.regime, icon: <Gauge size={13} />, bull: null },
              { label: 'Güven Seviyesi', value: taData.confidence, icon: <Shield size={13} />, bull: null },
            ].map((item) => (
              <div key={item.label} className="p-3.5 border border-border/40 rounded-xl bg-muted/10">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</span>
                </div>
                <span className={`text-sm font-bold ${item.bull === true ? 'text-emerald-500' : item.bull === false ? 'text-destructive' : 'text-foreground'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="border border-border/40 rounded-xl bg-muted/10 overflow-hidden divide-y divide-border/20">
              {[
                { label: 'RSI (14)', value: `${taData.rsi.value.toFixed(1)} — ${taData.rsi.status}`, icon: <BarChart3 size={12} /> },
                { label: 'MACD', value: taData.macd, icon: <Activity size={12} /> },
                { label: 'Bollinger', value: taData.bollinger_status, icon: <Target size={12} /> },
                { label: 'SMA 20', value: `₺${taData.sma.sma_20.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
                { label: 'SMA 50', value: `₺${taData.sma.sma_50.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
                { label: 'SMA 200', value: `₺${taData.sma.sma_200.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` },
                { label: 'Destek', value: `₺${taData.support_resistance.support.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <Shield size={12} /> },
                { label: 'Direnç', value: `₺${taData.support_resistance.resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <AlertTriangle size={12} /> },
                { label: 'Stop-Loss (ATR)', value: `₺${taData.atr_stop_loss.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <Shield size={12} /> },
                { label: 'Risk/Ödül', value: taData.rr_ratio.toFixed(2) },
                { label: 'Beta', value: taData.beta.toFixed(2) },
                { label: 'ADX', value: taData.market_regime.adx.toFixed(1) },
                { label: 'Piyasa Genişliği', value: `${taData.market_breadth.breadth.toFixed(1)}% — ${taData.market_breadth.status}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    {row.icon}
                    {row.label}
                  </span>
                  <span className="text-sm font-bold text-foreground font-mono">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="border border-border/40 rounded-xl bg-muted/10 p-4 space-y-3">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Skor Bileşenleri</span>
                {[
                  { label: 'Trend', value: taData.score_components.trend, max: 50, color: 'bg-emerald-500' },
                  { label: 'Momentum', value: taData.score_components.momentum, max: 30, color: 'bg-blue-500' },
                  { label: 'Hacim', value: taData.score_components.volume, max: 20, color: 'bg-primary' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-muted-foreground font-semibold">{bar.label}</span>
                      <span className="text-foreground font-bold">{bar.value}/{bar.max}</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2.5">Uyumsuzluklar</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'RSI Yükseliş', active: taData.divergences.rsi.bullish, color: 'text-emerald-500' },
                    { label: 'RSI Düşüş', active: taData.divergences.rsi.bearish, color: 'text-destructive' },
                    { label: 'MACD Yükseliş', active: taData.divergences.macd.bullish, color: 'text-emerald-500' },
                    { label: 'MACD Düşüş', active: taData.divergences.macd.bearish, color: 'text-destructive' },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center gap-2 text-xs">
                      <div className={`w-2.5 h-2.5 rounded-full ${d.active ? d.color : 'bg-muted/40'}`} />
                      <span className={`${d.active ? d.color : 'text-muted-foreground'} font-semibold`}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {taData.signals.length > 0 && (
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2.5">Aktif Sinyaller</span>
              <div className="flex flex-wrap gap-1.5">
                {taData.signals.map((s: any, i: any) => (
                  <SignalBadge key={i} signal={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MEMBERS ONLY: Advanced TA */}
      <LockedSection variant="anonymous" title="Gelişmiş Teknik Analiz" description="Detaylı teknik analiz ve AI yorumlarına erişmek için giriş yapın.">
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Gelişmiş Teknik Analiz</h3>
            <Lock size={12} className="text-muted-foreground ml-auto" />
          </div>
          <div className="border border-primary/20 rounded-xl bg-primary/5 p-4">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Sparkles size={11} /> AI Teknik Analiz Özeti
            </span>
            <p className="text-xs text-foreground/80 font-medium leading-relaxed">
              AI destekli teknik analiz özeti burada görünecek. RSI, MACD, Bollinger ve hacim analizleriyle birlikte kapsamlı teknik değerlendirme.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2">Formasyon Analizi</span>
              <p className="text-xs text-muted-foreground">Mum formasyonları ve grafik formasyonları detaylı analizi</p>
            </div>
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2">Dalga Analizi</span>
              <p className="text-xs text-muted-foreground">Elliott dalga prensibi ve dalga sayımları</p>
            </div>
          </div>
        </div>
      </LockedSection>

      {/* SUBSCRIBER ONLY: Premium TA */}
      <LockedSection variant="subscriber" title="Premium Teknik Analiz" description="Bu içeriğe erişmek için yükseltme yapın.">
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap size={14} />
            </div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Premium Teknik Analiz</h3>
            <Lock size={12} className="text-muted-foreground ml-auto" />
          </div>
          <div className="border border-amber-500/20 rounded-xl bg-amber-500/5 p-4">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Sparkles size={11} /> AI Detaylı Teknik Analiz
            </span>
            <p className="text-xs text-foreground/80 font-medium leading-relaxed">
              AI destekli detaylı teknik analiz raporu. Çoklu zaman dilimi analizi, formasyon tanımlama ve gelecek fiyat projeksiyonları.
            </p>
          </div>
          {taData && taData.candlestick_patterns.length > 0 && (
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <CandlestickChart size={11} /> Mum Formasyonları Detay
              </span>
              <div className="flex flex-wrap gap-1.5">
                {taData.candlestick_patterns.map((p: any, i: any) => (
                  <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">{p}</span>
                ))}
              </div>
            </div>
          )}
          {taData && taData.market_regime.recommended_strategy && (
            <div className="border border-primary/20 rounded-xl bg-primary/5 p-4">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Zap size={11} /> Önerilen Strateji
              </span>
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">{taData.market_regime.recommended_strategy}</p>
            </div>
          )}
        </div>
      </LockedSection>

      {/* TA Questions */}
      <div className="space-y-2.5 pt-2 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          <HelpCircle size={11} />
          <span>Önerilen Teknik Analiz Soruları</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {technicalQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={async () => {
                if (window.innerWidth < 1024) window.dispatchEvent(new CustomEvent('open-mobile-chat'))
                await sendMessage(q, chatContext)
              }}
              className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

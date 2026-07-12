import { createFileRoute } from '@tanstack/react-router'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { CeoTaReport } from '../components/company/CeoTaReport'
import { ScoreGauge } from '../constants/companyShared'
import { useCompanyData } from '../lib/useCompanyData'
import { useTAPublicSummary } from '../lib/useTechnicalAnalysis'
import { useAuth } from '../hooks/useAuth'
import {
  Activity, TrendingUp, BarChart3, AlertTriangle,
  Shield, Gauge, Lock, Sparkles, ChevronRight
} from 'lucide-react'

export const Route = createFileRoute('/hisse/$ticker/teknik-analiz')({
  component: TechnicalAnalysisPage,
})

function UserTierBadge({ tier }: { tier: string }) {
  if (tier === 'subscriber') return null
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground/60 px-3 py-1 rounded-full border border-border/30">
      <Lock size={10} />
      {tier === 'anonymous' ? 'Üyelere Özel' : 'Abonelere Özel'}
    </div>
  )
}

function LockedSection({
  tier,
  requiredTier,
  children,
}: {
  tier: string
  requiredTier: 'member' | 'subscriber'
  children: React.ReactNode
}) {
  const isLocked = tier === 'anonymous' && requiredTier === 'member' ||
    tier !== 'subscriber' && requiredTier === 'subscriber'

  if (!isLocked) return <>{children}</>

  const label = requiredTier === 'member' ? 'Üyelere Özel' : 'Abonelere Özel'
  const desc = requiredTier === 'member'
    ? 'Detaylı teknik göstergeler, sapma analizi ve sinyaller için üye olun.'
    : 'Yapay zeka destekli kapsamlı analiz raporu için abone olun.'
  const cta = requiredTier === 'member' ? 'Üye Ol' : 'Abone Ol'

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-30">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-lg">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock size={16} className="text-primary" />
          </div>
          <h4 className="text-base font-bold text-foreground mb-1">{label}</h4>
          <p className="text-sm text-muted-foreground mb-4">{desc}</p>
          <button className="inline-flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
            {cta}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function TechnicalAnalysisPage() {
  const { ticker } = Route.useParams()
  const { user, loading: authLoading } = useAuth()
  const tickerUpper = ticker.toUpperCase()

  // Determine access tier
  const userTier = !user ? 'anonymous' : (user.tier === 'pro' || user.tier === 'ultimate') ? 'subscriber' : 'member'

  const isSubscriber = userTier === 'subscriber'

  const { data: companyRaw, isLoading: companyLoading } = useCompanyData(tickerUpper)
  const { data: publicTa } = useTAPublicSummary(tickerUpper)

  const stats = companyRaw?.stats || null
  const taData = companyRaw?.taData || null
  const fundamentalDetail = companyRaw?.fundamentalDetail || null

  const weekChange = fundamentalDetail && stats?.price && fundamentalDetail.weekClose > 0
    ? ((stats.price - fundamentalDetail.weekClose) / fundamentalDetail.weekClose) * 100 : null
  const monthChange = fundamentalDetail && stats?.price && fundamentalDetail.monthClose > 0
    ? ((stats.price - fundamentalDetail.monthClose) / fundamentalDetail.monthClose) * 100 : null
  const yearChange = fundamentalDetail && stats?.price && fundamentalDetail.yearClose > 0
    ? ((stats.price - fundamentalDetail.yearClose) / fundamentalDetail.yearClose) * 100 : null
  const fmtPct = (v: number | null) => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : '-'

  const loading = authLoading || companyLoading

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-[360px] w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  // ── PUBLIC TIER ─────────────────────────────────────────────
  const publicData = publicTa as any

  return (
    <div className="space-y-5">
      <TradingViewChart symbol={tickerUpper} lastPrice={stats?.price || 0} />

      {fundamentalDetail && stats && (
        <div className="text-base text-muted-foreground">
          Hafta: <span className={`font-semibold ${(weekChange ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>{fmtPct(weekChange)}</span>
          {' · '}Ay: <span className={`font-semibold ${(monthChange ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>{fmtPct(monthChange)}</span>
          {' · '}Yıl: <span className={`font-semibold ${(yearChange ?? 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>{fmtPct(yearChange)}</span>
        </div>
      )}

      {/* ═══ PUBLIC TIER: Core Indicators ═══ */}
      {publicData && !publicData._blocked && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Teknik Görünüm</h3>
            <UserTierBadge tier={userTier} />
          </div>

          {publicData.score != null && (
            <div className="flex items-center gap-3">
              <ScoreGauge score={publicData.score} />
              <div>
                <div className="text-sm font-semibold text-foreground">{publicData.trend || 'Nötr'} trend</div>
                <div className="text-xs text-muted-foreground">{publicData.confidence || '—'} güven</div>
              </div>
            </div>
          )}

          {publicData.summary_text && (
            <p className="text-sm text-muted-foreground leading-relaxed">{publicData.summary_text}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Trend', value: publicData.trend || 'Nötr', icon: <TrendingUp size={14} />, bull: (publicData.trend || '').toLowerCase().includes('bull') },
              { label: 'RSI (14)', value: publicData.rsi != null ? publicData.rsi.toFixed(1) : '—', icon: <BarChart3 size={14} />, bull: null },
              { label: 'MACD', value: publicData.macd_status || 'Nötr', icon: <Activity size={14} />, bull: publicData.macd_status === 'Bullish' ? true : publicData.macd_status === 'Bearish' ? false : null },
              { label: 'Rejim', value: publicData.regime || '—', icon: <Gauge size={14} />, bull: null },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-base font-medium text-muted-foreground">{item.label}</span>
                </div>
                <span className={`text-base font-medium ${item.bull === true ? 'text-emerald-500' : item.bull === false ? 'text-destructive' : 'text-foreground'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="divide-y divide-border/15">
            {publicData.sma && [
              { label: 'SMA 20', value: publicData.sma.sma_20 ? `₺${publicData.sma.sma_20.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—' },
              { label: 'SMA 50', value: publicData.sma.sma_50 ? `₺${publicData.sma.sma_50.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—' },
              { label: 'SMA 200', value: publicData.sma.sma_200 ? `₺${publicData.sma.sma_200.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—' },
            ].filter(r => r.value !== '—').map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2.5">
                <span className="text-base font-medium text-muted-foreground">{row.label}</span>
                <span className="text-base font-semibold text-foreground font-mono">{row.value}</span>
              </div>
            ))}
            {[
              { label: 'Destek', value: publicData.nearest_support != null ? `₺${publicData.nearest_support.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : null },
              { label: 'Direnç', value: publicData.nearest_resistance != null ? `₺${publicData.nearest_resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : null },
            ].filter(r => r.value != null).map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2.5">
                <span className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                  {row.label === 'Destek' ? <Shield size={14} /> : <AlertTriangle size={14} />}
                  {row.label}
                </span>
                <span className="text-base font-semibold text-foreground font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SUBSCRIBER TIER: AI Report ═══ */}
      <LockedSection tier={userTier} requiredTier="subscriber">
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <Sparkles size={14} className="text-violet-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Abonelere Özel AI Analiz Raporu</h3>
          </div>
          <CeoTaReport ticker={tickerUpper} />
        </div>
      </LockedSection>
    </div>
  )
}



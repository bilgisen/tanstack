import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useCompScore, useCompProfile, useCompRatios, useCompTrends } from '../lib/useCompData'
import { FaReport } from '../components/company/FaReport'
import { ScoreGauge } from '../constants/companyShared'
import { RatioScoreRing } from '../components/company/RatioScoreRing'
import {
  Lock, TrendingUp, Shield, Sparkles, Building2, BarChart3
} from 'lucide-react'

export const Route = createFileRoute('/hisse/$ticker/temel-analiz')({
  component: FundamentalAnalysisPage,
})

const ABSOLUTE_LABEL_COLORS: Record<string, string> = {
  GÜÇLÜ: 'text-emerald-500',
  SAĞLIKLI: 'text-emerald-400',
  ORTA: 'text-yellow-500',
  ZAYIF: 'text-orange-500',
  KRİTİK: 'text-red-500',
}

const ABSOLUTE_LABEL_BG: Record<string, string> = {
  GÜÇLÜ: 'bg-emerald-500/10 border-emerald-500/20',
  SAĞLIKLI: 'bg-emerald-400/10 border-emerald-400/20',
  ORTA: 'bg-yellow-500/10 border-yellow-500/20',
  ZAYIF: 'bg-orange-500/10 border-orange-500/20',
  KRİTİK: 'bg-red-500/10 border-red-500/20',
}

function AbsoluteBadge({ label }: { label: string }) {
  const color = ABSOLUTE_LABEL_COLORS[label] || 'text-muted-foreground'
  const bg = ABSOLUTE_LABEL_BG[label] || 'bg-muted/20 border-border/20'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${bg} ${color}`}>
      {label}
    </span>
  )
}

function LockedSection({ tier, requiredTier, children }: { tier: string; requiredTier: 'member' | 'subscriber'; children: React.ReactNode }) {
  const { login } = useAuth()
  const isLocked = tier === 'anonymous' && requiredTier === 'member' ||
    tier !== 'subscriber' && requiredTier === 'subscriber'
  if (!isLocked) return <>{children}</>
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-30">{children}</div>
      <div className="absolute inset-0 flex items-start justify-center pt-8">
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center w-72 mx-auto shadow-lg">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock size={16} className="text-primary" />
          </div>
          <h4 className="text-base font-bold text-foreground mb-1">Abonelere Özel</h4>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">Hemen bağlanın 1 hafta ücretsiz deneyin</p>
          <button onClick={login} className="inline-flex items-center justify-center gap-2.5 w-full text-sm font-semibold bg-white text-[#1a1a2e] px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors border border-border/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile Bağlan
          </button>
        </div>
      </div>
    </div>
  )
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function FundamentalAnalysisPage() {
  const { ticker } = Route.useParams()
  const { user, loading: authLoading } = useAuth()
  const tickerUpper = ticker.toUpperCase()

  const userTier = !user ? 'anonymous' : (user.tier === 'pro' || user.tier === 'ultimate') ? 'subscriber' : 'member'

  const { data: scoreData, isLoading: scoreLoading } = useCompScore(tickerUpper)
  const { data: profileData, isLoading: profileLoading } = useCompProfile(tickerUpper)
  const { data: ratiosData, isLoading: ratiosLoading } = useCompRatios(tickerUpper)
  const { data: trendsData } = useCompTrends(tickerUpper)
  const loading = authLoading || scoreLoading || profileLoading || ratiosLoading

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-32 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const score = (scoreData as any) || null
  const profile = (profileData as any) || null
  const ratios = (ratiosData as any) || null
  const trends = (trendsData as any) || null
  const pillarLabels: Record<string, string> = {
    finansal_saglik: 'Finansal Sağlık',
    karlilik_buyume: 'Karlılık & Büyüme',
    degerleme: 'Değerleme',
  }

  return (
    <div className="space-y-5">

      {/* ═══ SCORE CARD ═══ */}
      {score && (
        <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] border border-border/40 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              Temel Analiz Puanı
            </h3>
            {score.reliability && (
              <span className="text-[10px] font-medium text-muted-foreground px-2 py-1 rounded-lg bg-muted/20 border border-border/20">
                {score.reliability}
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center gap-4">
              <ScoreGauge score={Math.round(score.composite_score)} size={80} />
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">
                  {score.company_name || tickerUpper}
                </div>
                {score.sector && (
                  <div className="text-xs text-muted-foreground">{score.sector}</div>
                )}
                {score.absolute && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono font-semibold text-foreground">{fmt(score.absolute.score)}</span>
                    <AbsoluteBadge label={score.absolute.label} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 flex-wrap">
              {score.ranks?.sector && (
                <div className="text-xs text-muted-foreground bg-muted/10 border border-border/20 rounded-xl px-3 py-2">
                  <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5">Sektör Sırası</div>
                  <div className="text-sm font-bold text-foreground">%{fmt(score.ranks.sector.percentile, 0)}</div>
                  <div className="text-[10px]">{score.ranks.sector.n_peers} şirket</div>
                </div>
              )}
              {score.ranks?.group && (
                <div className="text-xs text-muted-foreground bg-muted/10 border border-border/20 rounded-xl px-3 py-2">
                  <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5">Grup Sırası</div>
                  <div className="text-sm font-bold text-foreground">%{fmt(score.ranks.group.percentile, 0)}</div>
                  <div className="text-[10px]">{score.ranks.group.n_peers} şirket</div>
                </div>
              )}
            </div>
          </div>

          {/* 3 Pillar Score Rings */}
          {score.pillars && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/20">
              {Object.entries(score.pillars).map(([key, p]: [string, any]) => (
                <RatioScoreRing
                  key={key}
                  label={pillarLabels[key] || key}
                  score={Math.round(p.score)}
                  size={72}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ COMPANY PROFILE ═══ */}
      {profile && (
        <div className="border border-border/40 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Building2 size={14} className="text-primary" />
            Şirket Profili
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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

      {/* ═══ KEY RATIOS ═══ */}
      {ratios && ratios.ratios && ratios.ratios.length > 0 && (
        <div className="border border-border/40 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" />
            Finansal Rasyolar
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ratios.ratios.map((r: { code: string; value: number; name: string }) => (
              <div key={r.code} className="bg-muted/10 border border-border/20 rounded-xl px-4 py-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{r.name || r.code}</div>
                <div className="text-base font-bold font-mono text-foreground">{fmt(r.value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TRENDS ═══ */}
      {trends && trends.trends && Object.keys(trends.trends).length > 0 && (
        <div className="border border-border/40 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            Rasyo Trendleri
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wider py-2 pr-4 font-medium">Rasyo</th>
                  {trends.trends[Object.keys(trends.trends)[0]]?.values.map((v: any) => (
                    <th key={v.period} className="text-right text-[10px] text-muted-foreground uppercase tracking-wider py-2 px-2 font-medium">{v.period.slice(0, 6)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(trends.trends).map(([code, t]: [string, any]) => (
                  <tr key={code} className="border-b border-border/10 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground text-xs">{t.name || code}</td>
                    {t.values.map((v: any) => (
                      <td key={v.period} className="py-2.5 px-2 text-right font-mono text-sm text-foreground">{fmt(v.value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ AI FUNDAMENTAL ANALYSIS (LOCKED) ═══ */}
      <LockedSection tier={userTier} requiredTier="subscriber">
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <Sparkles size={14} className="text-violet-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Abonelere Özel AI Temel Analiz</h3>
          </div>
          <FaReport ticker={ticker} />
        </div>
      </LockedSection>
    </div>
  )
}

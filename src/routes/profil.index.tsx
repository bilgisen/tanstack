import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { TIER_CONFIG, EXTRA_HT_PRICING, type Tier } from '../lib/tiers'
import { 
  Mail, 
  Calendar, 
  CreditCard, 
  Zap, 
  Check, 
  ArrowRight,
  Star,
  Coins,
  Shield,
  Sparkles,
  Award,
  RefreshCw
} from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/profil/')({
  component: ProfilePage,
})

interface UserCredits {
  tier: string
  tierDisplayName: string
  monthlyHT: number
  usedHT: number
  extraHT: number
  availableHT: number
  usagePercent: number
  resetAt: string | Date
}

function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const json = await res.json()
        setCredits(json)
      }
    } catch (e) {
      console.error('Failed to load credits:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  const userTier: Tier = (credits?.tier as Tier) || ((user as any)?.tier || 'free')
  const tierConfig = TIER_CONFIG[userTier]

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ultimate':
        return <Award size={14} className="text-amber-400" />
      case 'pro':
        return <Sparkles size={14} className="text-violet-400" />
      case 'standard':
        return <Zap size={14} className="text-blue-400" />
      default:
        return <Shield size={14} className="text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground animate-pulse font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-primary" />
          <span>Profil Yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">

      {/* 1. User Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <img 
            src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full border-2 border-primary bg-card/50 shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground border border-background shadow-md">
            {getTierIcon(userTier)}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {user?.name || user?.email?.split("@")[0] || 'Kullanıcı'}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>
            {user?.emailVerified && (
              <div className="flex items-center gap-1 text-xs text-emerald-500">
                <Check size={12} />
                <span>Doğrulanmış</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
            <Calendar size={12} />
            <span>
              Üyelik: {new Date(user?.createdAt || Date.now()).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
            {tierConfig.displayName}
          </span>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50 uppercase font-mono">
            ID: {user?.id?.substring(0, 8)}...
          </span>
        </div>
      </div>

      {/* 2. Current Plan Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground tracking-tight">Mevcut Plan</h2>
            <p className="text-xs text-muted-foreground">Abonelik bilgileriniz</p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {tierConfig.displayName}
              </span>
              <div className="text-3xl font-black text-foreground mt-1 tracking-tight">
                {tierConfig.price === 0 ? 'Ücretsiz' : `${tierConfig.price.toLocaleString()} ₺`}
                {tierConfig.price > 0 && <span className="text-sm font-bold text-muted-foreground"> / ay</span>}
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Star size={28} className="text-primary" />
            </div>
          </div>

          <div className="border-t border-primary/10 pt-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Coins size={14} className="text-primary" />
                Aylık Hak
              </span>
              <span className="font-bold text-foreground">
                {tierConfig.monthlyHT.toLocaleString('tr-TR')} HT
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Günlük Sorgu</span>
              <span className="font-bold text-foreground">
                {tierConfig.dailyCallLimit || 'Sınırsız'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Takip Listesi</span>
              <span className="font-bold text-foreground">
                {tierConfig.watchlistLimit || 'Sınırsız'}
              </span>
            </div>
            {credits && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sıfırlanma Tarihi</span>
                <span className="font-mono text-foreground text-xs">
                  {new Date(credits.resetAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {credits && (
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Kota Kullanımı</span>
                <span className="text-foreground">%{credits.usagePercent}</span>
              </div>
              <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden border border-border/20">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${credits.usagePercent}%` }}
                />
              </div>
            </div>
          )}

          {userTier === 'free' && (
            <button
              onClick={() => {
                const plansSection = document.getElementById('plans')
                plansSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Zap size={16} />
              <span>Plan Yükselt</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 3. All Plans Section */}
      <div id="plans" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Planlar</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            İhtiyacınıza uygun planı seçin ve yapay zeka analiz gücünüzü artırın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(TIER_CONFIG) as Array<keyof typeof TIER_CONFIG>).map((tierKey) => {
            const config = TIER_CONFIG[tierKey]
            const isActive = tierKey === userTier
            const isPopular = tierKey === 'standard'

            return (
              <div
                key={tierKey}
                className={`rounded-2xl p-5 border transition-all relative overflow-hidden ${
                  isActive
                    ? 'border-primary/30 bg-primary/5 ring-1 ring-primary'
                    : isPopular
                      ? 'border-blue-500/40 bg-card shadow-md'
                      : 'border-white/5 bg-card hover:bg-muted/30'
                }`}
              >
                {isPopular && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Popüler
                  </span>
                )}
                {isActive && (
                  <span className="absolute top-3 right-3 bg-primary/20 text-primary font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/30">
                    Aktif
                  </span>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-foreground">{config.displayName}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Coins size={12} className="text-primary" />
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {config.monthlyHT.toLocaleString('tr-TR')} HT/ay
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-foreground">
                      {config.price === 0 ? 'Ücretsiz' : `${config.price.toLocaleString()}`}
                    </div>
                    {config.price > 0 && (
                      <span className="text-[10px] font-bold text-muted-foreground">₺ / ay</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check size={12} className={isActive ? 'text-primary' : 'text-muted-foreground/50'} />
                    <span>{config.dailyCallLimit || 'Sınırsız'} günlük sorgu</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check size={12} className={isActive ? 'text-primary' : 'text-muted-foreground/50'} />
                    <span>{config.watchlistLimit || 'Sınırsız'} takip listesi</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check size={12} className={isActive ? 'text-primary' : 'text-muted-foreground/50'} />
                    <span>{config.historyDays ? `${config.historyDays} Gün` : 'Sınırsız'} sohbet geçmişi</span>
                  </li>
                </ul>

                {!isActive && (
                  <button
                    onClick={() => navigate({ to: '/' })}
                    className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Seç
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Extra Credits */}
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <span className="text-sm font-extrabold text-foreground">Ek Kredi</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paket kotanız bittiğinde <strong>{EXTRA_HT_PRICING.amount.toLocaleString()} HT</strong> ek kredi alabilirsiniz. Süre sınırı yoktur.
              </p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="text-lg font-black text-foreground">+{EXTRA_HT_PRICING.amount.toLocaleString()} HT</div>
              <div className="text-xs font-bold text-amber-500">{EXTRA_HT_PRICING.price} ₺</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

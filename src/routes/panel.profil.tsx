import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { TIER_CONFIG, EXTRA_HT_PRICING, type Tier } from '../lib/tiers'
import { Coins, Sparkles, Zap, Shield, Check, RefreshCw, AlertCircle, Award } from 'lucide-react'

export const Route = createFileRoute('/panel/profil')({
  component: ProfilePage,
})

interface UserCredits {
  tier: string;
  tierDisplayName: string;
  monthlyHT: number;
  usedHT: number;
  extraHT: number;
  availableHT: number;
  usagePercent: number;
  resetAt: string | Date;
}

function ProfilePage() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const json = await res.json()
        setCredits(json)
      }
    } catch (e) {
      console.error('Failed to load profile credits:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  const handleCheckout = async (action: 'subscribe' | 'buy_extra', payload: { tier?: Tier; amount?: number }) => {
    const loadingKey = action === 'subscribe' ? `sub-${payload.tier}` : 'extra'
    setActionLoading(loadingKey)
    setNotification(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          tier: payload.tier,
          amount: payload.amount,
        }),
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: data.message })
        // Fetch updated credits info
        await fetchCredits()
        // Fire global update event for layout sidebars/selectors
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ht-balance-updated'))
        }
      } else {
        setNotification({ type: 'error', message: data.error || 'Ödeme simülasyonu başarısız oldu.' })
      }
    } catch (e) {
      console.error('Checkout error:', e)
      setNotification({ type: 'error', message: 'Sunucuyla iletişim kurulurken bir hata oluştu.' })
    } finally {
      setActionLoading(null)
    }
  }

  // Set timeout to dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ultimate':
        return <Award className="w-8 h-8 text-amber-400 animate-bounce" />
      case 'pro':
        return <Sparkles className="w-8 h-8 text-violet-400" />
      case 'standard':
        return <Zap className="w-8 h-8 text-blue-400" />
      default:
        return <Shield className="w-8 h-8 text-muted-foreground" />
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
    <div className="max-w-6xl mx-auto space-y-10 py-6 px-2 font-sans select-none animate-in fade-in duration-300">
      
      {/* Toast Notification Box */}
      {notification && (
        <div className={`fixed bottom-24 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-md animate-in slide-in-from-bottom-5 duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40 backdrop-blur-md' 
            : 'bg-rose-950/85 text-rose-300 border-rose-500/40 backdrop-blur-md'
        }`}>
          <AlertCircle size={18} className="shrink-0 animate-bounce" />
          <p className="text-xs font-semibold leading-relaxed">{notification.message}</p>
        </div>
      )}

      {/* 1. Header Profile & Balance Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Details (Glassmorphic) */}
        <div className="lg:col-span-1 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-6 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative">
            <img 
              src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full border-2 border-primary bg-card/50 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground border border-background shadow-md">
              {getTierIcon(credits?.tier || 'free')}
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-foreground mt-4 tracking-tight">
            {user?.email?.split("@")[0]}
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">{user?.email}</p>

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              Rol: {(user as any)?.role || 'Üye'}
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50 uppercase font-mono">
              ID: {user?.id?.substring(0, 8)}...
            </span>
          </div>

          <div className="w-full border-t border-border/30 my-5" />

          <div className="w-full flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-semibold">Mevcut Paket:</span>
            <span className="font-extrabold text-foreground">{credits?.tierDisplayName}</span>
          </div>

          {credits && (
            <div className="w-full flex items-center justify-between text-xs mt-3">
              <span className="text-muted-foreground font-semibold">Sıfırlanma Tarihi:</span>
              <span className="font-mono text-foreground">
                {new Date(credits.resetAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic HToken Credit Status (Glassmorphic) */}
        <div className="lg:col-span-2 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Coins className="w-6 h-6 text-primary animate-pulse" />
              <h3 className="text-md font-extrabold text-foreground tracking-tight">HToken Kredi Detayları</h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Zap size={10} className="fill-primary" />
              Yapay Zeka Yakıtı
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            
            {/* Toplam Bakiye */}
            <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Kullanılabilir Toplam</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {credits?.availableHT.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-primary">HT</span>
              </div>
            </div>

            {/* Aylık Kota */}
            <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Aylık Paket Kotası</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-foreground">
                  {credits?.monthlyHT.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">HT</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">Harcanan: {credits?.usedHT.toLocaleString()} HT</span>
            </div>

            {/* Ek Krediler */}
            <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Satın Alınan Ek Kredi</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-foreground">
                  {credits?.extraHT.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">HT</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-1">Süre sınırı yoktur</span>
            </div>

          </div>

          {/* Progress Usage Indicator */}
          {credits && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Kota Tüketim Oranı</span>
                <span className="text-foreground">%{credits.usagePercent} Tüketildi</span>
              </div>
              <div className="w-full bg-muted/40 rounded-full h-3 overflow-hidden border border-border/20">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${credits.usagePercent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                * Yapay zeka chatbot her sorunuzu analiz ederken kullandığı model tipine, girdi ve çıktı kelime sayısına bağlı olarak bakiye düşer. Standart modeller daha ekonomik, gelişmiş modeller ise daha fazla HT harcar.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* 2. Subscription Pricing Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight sm:text-3xl">Abonelik Paketleri</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Hisse senedi analiz gücünüzü bir üst seviyeye taşıyın! İhtiyacınıza uygun paketi seçin ve anında premium yapay zeka modellerini kullanmaya başlayın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          
          {/* Loop over tiers */}
          {(Object.keys(TIER_CONFIG) as Array<keyof typeof TIER_CONFIG>).map((tierKey) => {
            const config = TIER_CONFIG[tierKey]
            const isCurrent = credits?.tier === tierKey
            const isPopular = tierKey === 'standard' // Highlight Standart plan as popular
            const isActionLoading = actionLoading === `sub-${tierKey}`

            return (
              <div 
                key={tierKey}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group select-none ${
                  isCurrent 
                    ? 'bg-primary/5 border-primary shadow-[0_0_20px_rgba(14,117,236,0.15)] ring-1 ring-primary' 
                    : isPopular
                      ? 'bg-card border-blue-500/60 shadow-lg scale-102 hover:scale-104 z-10'
                      : 'bg-card/70 border-border/50 hover:border-border/80 hover:bg-card'
                }`}
              >
                {/* Popular highlight tag */}
                {isPopular && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-pulse">
                    EN POPÜLER
                  </span>
                )}

                {/* Current plan highlight tag */}
                {isCurrent && (
                  <span className="absolute top-3 right-3 bg-primary/20 text-primary font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-primary/30">
                    AKTİF PLAN
                  </span>
                )}

                <div>
                  {/* Name and HToken Allocation */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-foreground">{config.displayName}</h3>
                    <div className="flex items-center gap-1 text-primary">
                      <Coins size={12} className="fill-primary/20" />
                      <span className="text-xs font-bold">{config.monthlyHT.toLocaleString()} HToken / Ay</span>
                    </div>
                  </div>

                  {/* Price info */}
                  <div className="my-5 flex items-baseline gap-1">
                    {config.price === 0 ? (
                      <span className="text-3xl font-black text-foreground tracking-tight">Ücretsiz</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-foreground tracking-tight">
                          {config.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-muted-foreground">TL / Ay</span>
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/30 my-4" />

                  {/* Features List */}
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5 text-xs text-foreground">
                      <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Günlük Limit: {config.dailyCallLimit ? `${config.dailyCallLimit} Sorgu` : 'Sınırsız'}</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-foreground">
                      <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Takip Listesi Limiti: {config.watchlistLimit ? `${config.watchlistLimit} Adet` : 'Sınırsız'}</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-foreground">
                      <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Sohbet Geçmişi: {config.historyDays ? `${config.historyDays} Gün` : 'Sınırsız'}</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-foreground">
                      <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        {tierKey === 'free' 
                          ? 'Temel Analiz Modelleri' 
                          : tierKey === 'standard' 
                            ? 'Gelişmiş Modeller (Gemini, Llama)' 
                            : 'Premium Dev Modeller (Claude Opus, DeepSeek R1)'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Simulated Purchase Button */}
                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-xl border border-primary/20 text-primary text-xs font-bold py-2.5 bg-primary/5 cursor-not-allowed text-center"
                    >
                      Şu anki Paketiniz
                    </button>
                  ) : (
                    <button
                      disabled={isActionLoading || actionLoading !== null}
                      onClick={() => handleCheckout('subscribe', { tier: tierKey })}
                      className={`w-full rounded-xl text-xs font-extrabold py-2.5 text-center transition-all duration-200 cursor-pointer shadow-3xs active:scale-[0.98] ${
                        isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {isActionLoading ? (
                        <RefreshCw size={14} className="animate-spin mx-auto text-current" />
                      ) : (
                        'Hemen Satın Al'
                      )}
                    </button>
                  )}
                </div>

              </div>
            )
          })}

        </div>
      </div>

      {/* 3. Extra Credits Section (Glassmorphic Banner) */}
      <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md p-6 relative overflow-hidden group select-none flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Background gradient flare */}
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">Ek Krediye mi İhtiyacınız Var?</h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Paket kotanız bittiğinde endişelenmeyin! Aylık aboneliğinizi değiştirmeden dilediğiniz zaman <strong>{EXTRA_HT_PRICING.amount.toLocaleString()} HT</strong> ek kredi alabilirsiniz. Satın alınan ek kredilerin süre sınırı yoktur ve sonraki aylara devreder.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 relative z-10">
          
          {/* Price Tag */}
          <div className="bg-muted/30 border border-border/30 rounded-2xl px-5 py-3 text-center sm:text-left flex flex-col justify-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Ek Paket Fiyatı</span>
            <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-0.5">
              <span className="text-xl font-black text-foreground">+{EXTRA_HT_PRICING.amount.toLocaleString()} HT</span>
              <span className="text-xs text-muted-foreground font-bold">/</span>
              <span className="text-sm font-black text-amber-500">{EXTRA_HT_PRICING.price} TL</span>
            </div>
          </div>

          {/* Simulated Purchase Button */}
          <button
            disabled={actionLoading !== null}
            onClick={() => handleCheckout('buy_extra', { amount: EXTRA_HT_PRICING.amount })}
            className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-4.5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {actionLoading === 'extra' ? (
              <RefreshCw size={14} className="animate-spin text-current" />
            ) : (
              <>
                <Zap size={13} className="fill-slate-950" />
                <span>Yükle (Ödeme Simüle Et)</span>
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  )
}

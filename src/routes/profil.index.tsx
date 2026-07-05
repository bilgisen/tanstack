import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { TIER_CONFIG, type Tier } from '../lib/tiers'
import { 
  Mail, 
  Calendar, 
  Zap, 
  Check, 
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

      {/* 2. Upgrade Section */}
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Abone olun</h2>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {/* Standard -> Abone */}
          <div className={`rounded-2xl p-5 border transition-all ${
            userTier === 'standard'
              ? 'border-primary/30 bg-primary/5 ring-1 ring-primary'
              : 'border-white/5 bg-card hover:bg-muted/30'
          }`}>
            {userTier === 'standard' && (
              <span className="inline-block mb-3 bg-primary/20 text-primary font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/30">
                Aktif
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-foreground">Abone</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Coins size={12} className="text-primary" />
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {TIER_CONFIG.standard.monthlyHT.toLocaleString('tr-TR')} HT/ay
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-foreground">
                  {TIER_CONFIG.standard.price.toLocaleString()}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">₺ / ay</span>
              </div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check size={12} className={userTier === 'standard' ? 'text-primary' : 'text-muted-foreground/50'} />
                <span>{TIER_CONFIG.standard.dailyCallLimit} günlük sorgu</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check size={12} className={userTier === 'standard' ? 'text-primary' : 'text-muted-foreground/50'} />
                <span>{TIER_CONFIG.standard.watchlistLimit} takip listesi</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check size={12} className={userTier === 'standard' ? 'text-primary' : 'text-muted-foreground/50'} />
                <span>{TIER_CONFIG.standard.historyDays} Gün sohbet geçmişi</span>
              </li>
            </ul>
            {userTier !== 'standard' && (
              <button
                onClick={() => navigate({ to: '/' })}
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                Seç
              </button>
            )}
          </div>

          {/* Pro -> Pro Abone */}
          <div className={`rounded-2xl p-5 border transition-all ${
            userTier === 'pro'
              ? 'border-primary/30 bg-primary/5 ring-1 ring-primary'
              : 'border-blue-500/40 bg-card shadow-md'
          }`}>
            <span className="inline-block mb-3 bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Popüler
            </span>
            {userTier === 'pro' && (
              <span className="inline-block ml-2 mb-3 bg-primary/20 text-primary font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/30">
                Aktif
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-foreground">Pro Abone</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Coins size={12} className="text-primary" />
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {TIER_CONFIG.pro.monthlyHT.toLocaleString('tr-TR')} HT/ay
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-foreground">
                  {TIER_CONFIG.pro.price.toLocaleString()}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">₺ / ay</span>
              </div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check size={12} className={userTier === 'pro' ? 'text-primary' : 'text-muted-foreground/50'} />
                <span>Sınırsız günlük sorgu</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check size={12} className={userTier === 'pro' ? 'text-primary' : 'text-muted-foreground/50'} />
                <span>{TIER_CONFIG.pro.watchlistLimit} takip listesi</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check size={12} className={userTier === 'pro' ? 'text-primary' : 'text-muted-foreground/50'} />
                <span>Sınırsız sohbet geçmişi</span>
              </li>
            </ul>
            {userTier !== 'pro' && (
              <button
                onClick={() => navigate({ to: '/' })}
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_12px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
              >
                Hemen Satın Al
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

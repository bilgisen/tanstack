import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Calendar,
  Coins,
  Mail,
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { TIER_CONFIG  } from '../lib/tiers'
import { Badge } from '../components/ui/badge'
import type {Tier} from '../lib/tiers';

export const Route = createFileRoute('/profil/')({
  component: ProfilePage,
})

interface UserCredits {
  tier: string
  tierDisplayName: string
  monthlyJT: number
  usedJT: number
  extraJT: number
  availableJT: number
  usagePercent: number
  resetAt: string | Date
  dodoCustomerId: string | null
}

function ProfilePage() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const json = await res.json() as UserCredits
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

  const handleSubscribe = (tier: string) => {
    const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG]
    if (!('dodoProductId' in config) || !config.dodoProductId) return
    const params = new URLSearchParams()
    params.set('productId', config.dodoProductId)
    if (user?.id) params.set('metadata_user_id', user.id)
    if (user?.email) params.set('email', user.email)
    if (user?.name) params.set('fullName', user.name)
    window.location.href = `/api/checkout-dodo?${params}`
  }

  const handleManageSubscription = () => {
    if (!credits?.dodoCustomerId) return
    window.location.href = `/api/customer-portal?customer_id=${credits.dodoCustomerId}`
  }

  const rawTier = credits?.tier || user?.tier || 'free'
  const userTier: Tier = Object.keys(TIER_CONFIG).includes(rawTier) ? rawTier as Tier : 'free'
  const tierConfig = TIER_CONFIG[userTier]

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'proabone':
        return <Sparkles size={14} className="text-violet-400" />
      case 'jetabone':
        return <Zap size={14} className="text-blue-400" />
      default:
        return <Shield size={14} className="text-muted-foreground" />
    }
  }

  const barData = credits
    ? [
        { name: 'Kullanılan', value: credits.usedJT, fill: 'hsl(var(--primary))' },
        { name: 'Kalan', value: credits.availableJT, fill: 'hsl(var(--primary) / 0.2)' },
      ]
    : []

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

      {/* 1. User Profile + Welcome */}
      <div className="rounded-2xl border border-border/20 bg-card overflow-hidden">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center pt-8 pb-6 px-6">
          <div className="relative mb-4">
            <img
              src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-primary bg-background/50 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground border border-background shadow-md">
              {getTierIcon(userTier)}
            </div>
          </div>

          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            {user?.name || user?.email?.split("@")[0] || 'Kullanıcı'}
          </h1>

          <div className="flex items-center gap-3 mt-1.5">
            <Badge variant={userTier === 'free' ? 'secondary' : 'default'} className="capitalize">
              {getTierIcon(userTier)}
              <span className="ml-1">{tierConfig.displayName}</span>
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail size={11} />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-2">
            <Calendar size={10} />
            <span>
              Üyelik: {mounted ? new Date(user?.createdAt || Date.now()).toLocaleDateString('tr-TR') : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Credit Status */}
      {credits && (
        <div className="rounded-2xl border border-border/20 bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
              <h2 className="text-base font-bold text-foreground">Kredi Durumu</h2>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-foreground tabular-nums">
                {credits.availableJT.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">JT</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">Kullanılabilir</div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" barSize={16} margin={{ top: 0, right: 0, bottom: 0, left: 85 }}>
                <XAxis type="number" hide />
                <Bar dataKey="value" radius={[0, 3, 3, 0]} isAnimationActive={false}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/10 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-primary" />
              <span>Kullanılan: <strong className="text-foreground">{credits.usedJT.toLocaleString()} JT</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }} />
              <span>Aylık kota: <strong className="text-foreground">{credits.monthlyJT.toLocaleString()} JT</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Subscription Plans */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Zap size={16} />
          </div>
          <h2 className="text-base font-bold text-foreground">Abonelik Planları</h2>
        </div>

        <div className="space-y-4">
          {/* JetAbone */}
          <div className={`rounded-2xl p-5 border transition-all ${
            userTier === 'jetabone'
              ? 'border-primary/30 bg-primary/5 ring-1 ring-primary'
              : 'border-border/20 bg-card hover:border-primary/20 hover:bg-muted/20'
          }`}>
            {userTier === 'jetabone' && (
              <Badge variant="default" className="mb-2 uppercase tracking-wider text-[9px]">
                Aktif
              </Badge>
            )}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground">JetAbone</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Coins size={11} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground">100K JT / ay</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-foreground">{TIER_CONFIG.jetabone.price.toLocaleString()}</div>
                <span className="text-[9px] font-bold text-muted-foreground">₺ / ay</span>
              </div>
            </div>
            <button
              onClick={() => userTier === 'jetabone' ? handleManageSubscription() : handleSubscribe('jetabone')}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
              {userTier === 'jetabone' ? 'Aboneliği Yönet' : 'Hemen Yükselt'}
            </button>
          </div>

          {/* ProAbone */}
          <div className={`rounded-2xl p-5 border transition-all ${
            userTier === 'proabone'
              ? 'border-primary/30 bg-primary/5 ring-1 ring-primary'
              : 'border-blue-500/30 bg-card hover:border-blue-500/50 hover:bg-muted/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-600 text-white border-blue-600 uppercase tracking-wider text-[9px]">
                Popüler
              </Badge>
              {userTier === 'proabone' && (
                <Badge variant="default" className="uppercase tracking-wider text-[9px]">
                  Aktif
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground">ProAbone</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Coins size={11} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground">500K JT / ay</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-foreground">{TIER_CONFIG.proabone.price.toLocaleString()}</div>
                <span className="text-[9px] font-bold text-muted-foreground">₺ / ay</span>
              </div>
            </div>
            <button
              onClick={() => userTier === 'proabone' ? handleManageSubscription() : handleSubscribe('proabone')}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
            >
              {userTier === 'proabone' ? 'Aboneliği Yönet' : 'Hemen Yükselt'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Coins, Sparkles, ChevronRight, Zap } from 'lucide-react'

interface CreditsData {
  tier: string;
  tierDisplayName: string;
  monthlyHT: number;
  usedHT: number;
  extraHT: number;
  availableHT: number;
  usagePercent: number;
  resetAt: string | Date;
}

export function HTDashboard({ collapsed = false }: { collapsed?: boolean }) {
  const [data, setData] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error('Failed to fetch user credits info:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()

    // Listen to custom balance update events
    window.addEventListener('ht-balance-updated', fetchCredits)
    return () => {
      window.removeEventListener('ht-balance-updated', fetchCredits)
    }
  }, [])

  if (loading) {
    return (
      <div className={`p-4 rounded-2xl bg-muted/20 animate-pulse border border-border/35 ${collapsed ? 'w-9 h-9 p-0 flex items-center justify-center' : ''}`}>
        {!collapsed && <div className="h-4 bg-muted/40 rounded-md w-1/2 mb-3"></div>}
        {!collapsed && <div className="h-2 bg-muted/40 rounded-full w-full"></div>}
      </div>
    )
  }

  if (!data) return null

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'ultimate':
        return 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/35'
      case 'pro':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/35'
      case 'standard':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/35'
      default:
        return 'bg-muted/40 text-muted-foreground border-border/50'
    }
  }

  if (collapsed) {
    return (
      <Link
        to="/profil"
        className="relative group w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/40 transition-all duration-200 cursor-pointer border border-border/30"
        title={`Bakiye: ${data.availableHT.toLocaleString()} Jet Token (${data.tierDisplayName})`}
      >
        <Coins size={14} className="text-primary group-hover:scale-110 transition-transform duration-200" />
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground font-sans border border-background shadow-xs select-none">
          {data.availableHT >= 1000 ? `${(data.availableHT / 1000).toFixed(0)}k` : data.availableHT}
        </span>
      </Link>
    )
  }

  return (
    <div className="p-4 rounded-2xl bg-card/65 backdrop-blur-xl border border-border/50 shadow-lg flex flex-col space-y-3.5 transition-all duration-300 hover:border-border select-none relative overflow-hidden group">
      {/* Background Gradient Pulse Decorator */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Coins size={15} className="text-primary animate-pulse" />
          <span className="text-xs font-bold text-foreground">Jet Token Bakiyesi</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getTierBadgeClass(data.tier)}`}>
          {data.tierDisplayName}
        </span>
      </div>

      {/* HToken Balance Large Number */}
      <div className="flex flex-col relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground tracking-tight">
            {data.availableHT.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-primary">Jet Token</span>
        </div>
        
        {data.extraHT > 0 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Zap size={9} className="text-amber-400 shrink-0 fill-amber-400" />
            <span>({data.extraHT.toLocaleString()} Jet Token ek kredi dahil)</span>
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden border border-border/20">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${100 - data.usagePercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Kalan Aylık: {Math.max(0, data.monthlyHT - data.usedHT).toLocaleString()} Jet Token</span>
          <span>%{data.usagePercent} Tüketildi</span>
        </div>
      </div>

      {/* Profile/Upgrade CTA */}
      <Link
        to="/profil"
        className="flex items-center justify-between w-full bg-muted/40 hover:bg-muted/80 text-[11px] font-semibold text-foreground rounded-xl py-1.5 px-3 border border-border/60 hover:border-border transition-all duration-200 cursor-pointer shadow-3xs active:scale-[0.98] relative z-10"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles size={11} className="text-primary" />
          <span>Paketi Yükselt / Kredi Al</span>
        </span>
        <ChevronRight size={11} className="text-muted-foreground" />
      </Link>
    </div>
  )
}

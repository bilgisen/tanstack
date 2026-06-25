import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { TIER_CONFIG, type Tier } from '../lib/tiers'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CreditCard, 
  Zap, 
  Check, 
  ArrowRight,
  Star
} from 'lucide-react'

export const Route = createFileRoute('/profil/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const userTier: Tier = (user as any)?.tier || 'free'
  const tierConfig = TIER_CONFIG[userTier]

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Profil
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Hesap bilgilerinizi ve planınızı yönetin
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* User Info Card */}
            <div className="rounded-2xl border border-white/10 bg-card p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User size={28} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground truncate">
                    {user?.name || 'Kullanıcı'}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail size={14} />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    {user?.emailVerified && (
                      <div className="flex items-center gap-1 text-xs text-emerald-500">
                        <Check size={12} />
                        <span>Doğrulanmış</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Calendar size={12} />
                    <span>
                      Üyelik: {new Date(user?.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Plan Card */}
            <div className="rounded-2xl border border-white/10 bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Mevcut Plan</h3>
                  <p className="text-xs text-muted-foreground">Abonelik bilgileriniz</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {tierConfig.displayName}
                    </span>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      {tierConfig.price === 0 ? 'Ücretsiz' : `${tierConfig.price} TL`}
                      {tierConfig.price > 0 && <span className="text-sm font-normal text-muted-foreground">/ay</span>}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star size={24} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aylık Hak</span>
                  <span className="font-medium text-foreground">
                    {tierConfig.monthlyHT.toLocaleString('tr-TR')} HT
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Günlük Sorgu</span>
                  <span className="font-medium text-foreground">
                    {tierConfig.dailyCallLimit || 'Sınırsız'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Takip Listesi</span>
                  <span className="font-medium text-foreground">
                    {tierConfig.watchlistLimit || 'Sınırsız'}
                  </span>
                </div>
              </div>

              {/* Upgrade Button */}
              {userTier === 'free' && (
                <button
                  onClick={() => navigate({ to: '/' })}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Zap size={16} />
                  <span>Plan Yükselt</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Pricing Plans */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-card p-6 sticky top-6">
              <h3 className="font-bold text-foreground mb-4">Planlar</h3>
              
              <div className="space-y-3">
                {Object.entries(TIER_CONFIG).map(([key, config]) => {
                  const isActive = key === userTier
                  return (
                    <div
                      key={key}
                      className={`rounded-xl p-4 border transition-colors ${
                        isActive
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-white/5 bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {config.displayName}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {config.price === 0 ? 'Ücretsiz' : `${config.price} TL`}
                        {config.price > 0 && <span className="text-xs font-normal text-muted-foreground">/ay</span>}
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        <li className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check size={12} className={isActive ? 'text-primary' : 'text-muted-foreground/50'} />
                          <span>{config.monthlyHT.toLocaleString('tr-TR')} HT/ay</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check size={12} className={isActive ? 'text-primary' : 'text-muted-foreground/50'} />
                          <span>{config.dailyCallLimit || 'Sınırsız'} günlük sorgu</span>
                        </li>
                      </ul>
                    </div>
                  )
                })}
              </div>

              {/* Extra Credits Info */}
              <div className="mt-4 p-4 rounded-xl border border-dashed border-white/10 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">Ek Kredi</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  10.000 HT ek kredi: 449 TL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

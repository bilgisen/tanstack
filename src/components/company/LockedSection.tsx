import { Lock, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { TIER_CONFIG, type Tier } from '../../lib/tiers'

type LockedSectionProps = {
  children: React.ReactNode
  variant?: 'anonymous' | 'subscriber'
  title?: string
  description?: string
}

// Check if user has required tier level
function hasRequiredTier(userTier: Tier | null, requiredVariant: 'anonymous' | 'subscriber'): boolean {
  if (!userTier) return requiredVariant === 'anonymous'
  
  if (requiredVariant === 'anonymous') {
    // Any logged-in user can access anonymous content
    return true
  }
  
  if (requiredVariant === 'subscriber') {
    // Only pro and ultimate can access subscriber content
    return userTier === 'pro' || userTier === 'ultimate'
  }
  
  return false
}

export function LockedSection({
  children,
  variant = 'anonymous',
  title,
  description,
}: LockedSectionProps) {
  const { user, login } = useAuth()
  
  // Get user's tier from profile
  const userTier = user?.tier as Tier | null
  const isAnonymous = !user
  const hasAccess = hasRequiredTier(userTier, variant)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-[6px] pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl border border-border/30">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {title || (isAnonymous ? 'Bu İçerik Üyelere Özeldir' : 'Premium İçerik')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {description || (isAnonymous
                ? 'Detaylı analizlere erişmek için Google ile giriş yapın.'
                : 'Bu içeriğe erişmek için yükseltme yapın.')}
            </p>
          </div>
          <button
            onClick={isAnonymous ? login : undefined}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {isAnonymous ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile Bağlan
              </>
            ) : (
              <>
                <ArrowUpCircle size={14} />
                Pro'ya Yükselt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

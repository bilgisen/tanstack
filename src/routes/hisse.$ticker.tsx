import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, Activity, Star, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { Skeleton } from '../components/ui/skeleton'
import { useWatchlistStore } from '../store/watchlist'
import { useCompanyQuote } from '../lib/useCompanyData'

export const Route = createFileRoute('/hisse/$ticker')({
  component: CompanyLayout,
})

const TABS = [
  { suffix: '', label: 'Genel Bakış', icon: Activity },
  { suffix: '/teknik-analiz', label: 'Teknik Analiz', icon: Activity },
]

function CompanyLayout() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const displayName = (companyNames as Record<string, string>)[tickerUpper] || tickerUpper
  const logoFile = companyLogos[tickerUpper as keyof typeof companyLogos]

  const { data: quote, isLoading: loading } = useCompanyQuote(tickerUpper)

  const { watchlists, addItem, removeItem } = useWatchlistStore()
  const defaultWatchlist = watchlists.find(w => w.isDefault) || watchlists[0]
  const isStarred = defaultWatchlist?.items.some(item => item.symbol === tickerUpper) ?? false

  const toggleWatchlist = () => {
    if (!defaultWatchlist) return
    if (isStarred) {
      removeItem(defaultWatchlist.id, tickerUpper)
    } else {
      addItem(defaultWatchlist.id, tickerUpper, 'stock')
    }
  }

  const chatContext = `sirket:${tickerUpper}`
  const basePath = `/hisse/${ticker.toLowerCase()}`

  const stats = quote ? { name: displayName, code: tickerUpper, price: quote.last_price || 0, diffPercent: quote.diff_percent || 0, high: 0, low: 0, open: 0, close: 0, volume: '-' } : null

  if (loading || !stats) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`}>
        <div className="space-y-5 pb-8">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-[360px] w-full rounded-2xl" />
        </div>
      </PublicPageLayout>
    )
  }

  const isUp = stats.diffPercent >= 0

  const formatVol = (v: number | string | undefined) => {
    if (v == null || v === '-') return '-'
    const n = typeof v === 'string' ? parseFloat(v) : v
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
    return n.toLocaleString('tr-TR')
  }

  const formatPrice = (v: number | undefined | null) => {
    if (v == null || v <= 0) return '-'
    return `₺${v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } catch { return null }
  }

  return (
    <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`}>
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">

        {/* Ticker Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {logoFile ? (
              <img src={`/logos/${logoFile}`} alt={tickerUpper} className="h-10 w-10 rounded object-contain bg-white shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{tickerUpper.slice(0, 2)}</div>
            )}
            <div className="min-w-0 space-y-0.5">
              <span className="text-sm text-muted-foreground font-semibold tracking-tight">{tickerUpper}</span>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold text-foreground tracking-tight truncate">{stats.name}</h1>
                <button
                  onClick={toggleWatchlist}
                  className={`shrink-0 transition-all duration-200 ${
                    isStarred
                      ? 'text-amber-500 hover:text-amber-400'
                      : 'text-muted-foreground/40 hover:text-muted-foreground'
                  }`}
                  title={isStarred ? 'Takip Listesinden Çıkar' : 'Takip Listeme Ekle'}
                >
                  <Star size={14} fill={isStarred ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight block leading-none">
              {stats.price > 0 ? stats.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
            </span>
            <span className={`text-xs md:text-sm font-bold inline-flex items-center gap-0.5 ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
              {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isUp ? '+' : ''}{stats.diffPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 -mt-1">
          <div className="flex items-center gap-3">
            <span className="font-medium">Hacim: <span className="text-foreground/70 font-semibold">{formatVol(quote?.volume)}</span></span>
            <span className="flex items-center gap-0.5 text-destructive/70">
              <ChevronDown size={10} />
              <span className="text-foreground/70 font-semibold">{formatPrice(quote?.low_price)}</span>
            </span>
            <span className="flex items-center gap-0.5 text-emerald-500/70">
              <ChevronUp size={10} />
              <span className="text-foreground/70 font-semibold">{formatPrice(quote?.high_price)}</span>
            </span>
          </div>
          {formatTime(quote?.record_date) && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <Clock size={10} />
              Son güncelleme: {formatTime(quote?.record_date)}
            </span>
          )}
        </div>

        {/* Tab Nav */}
        <nav className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const to = tab.suffix === '' ? basePath : `${basePath}${tab.suffix}`
            return (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: tab.suffix === '' }}
                activeProps={{ className: 'bg-primary text-primary-foreground border border-primary shadow-sm' }}
                inactiveProps={{ className: 'text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/60 bg-transparent' }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
              >
                <tab.icon size={14} />
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {/* Child route content */}
        <Outlet />
      </div>
    </PublicPageLayout>
  )
}

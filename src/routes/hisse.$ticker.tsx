import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, Activity, Star } from 'lucide-react'
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

  return (
    <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`}>
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">

        {/* Ticker Header */}
        <div className="border border-border/40 bg-card/30 rounded-2xl p-4 md:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {logoFile ? (
              <img src={`/logos/${logoFile}`} alt={tickerUpper} className="h-12 w-12 rounded-md object-contain bg-white shrink-0 shadow-3xs" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary font-bold text-base shrink-0">{tickerUpper.slice(0, 2)}</div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">{tickerUpper}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight truncate">{stats.name}</h1>
                <button
                  onClick={toggleWatchlist}
                  className={`shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
                    isStarred
                      ? 'text-amber-500 hover:text-amber-400 bg-amber-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                  title={isStarred ? 'Takip Listesinden Çıkar' : 'Takip Listeme Ekle'}
                >
                  <Star size={18} fill={isStarred ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight block leading-none">
                {stats.price > 0 ? stats.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
              </span>
              <span className={`text-sm md:text-lg font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1.5 ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{stats.diffPercent.toFixed(2)}%
              </span>
            </div>
          </div>
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

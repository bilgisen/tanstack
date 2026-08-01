import { Link, Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { Activity, ArrowDown, ArrowUp, BarChart3, ChevronDown, ChevronUp, Clock, Factory, FileText, Info, Star } from 'lucide-react'
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
  { suffix: '', label: 'Genel Bakış', icon: Info },
  { suffix: '/teknik-analiz', label: 'Teknik Analiz', icon: Activity },
  { suffix: '/temel-analiz', label: 'Temel Analiz', icon: BarChart3 },
  { suffix: '/tablolar', label: 'Tablolar', icon: FileText },
  { suffix: '/sektor', label: 'Sektör', icon: Factory },
]

function CompanyLayout() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const displayName = (companyNames as Record<string, string>)[tickerUpper] || tickerUpper
  const logoFile = companyLogos[tickerUpper as keyof typeof companyLogos]

  const location = useLocation()
  const subpage = location.pathname.replace(`/hisse/${ticker.toLowerCase()}`, '').replace('/', '') || 'genel-bakis'
  const chatContext = `sirket:${tickerUpper}:${subpage}`

  const { data: quote, isLoading: loading, isError } = useCompanyQuote(tickerUpper)

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

  const basePath = `/hisse/${ticker.toLowerCase()}`

  const starterQuestions = (() => {
    switch (subpage) {
      case 'teknik-analiz':
        return [
          'Teknik analiz raporu hazırla',
          'Trend ve momentum analizi yap',
          'Destek ve direnç seviyelerini listele',
          'ATR bazlı stop-loss seviyesi hesapla',
        ]
      case 'temel-analiz':
        return [
          'Finansal rasyoları incele (F/K, PD/DD, ROE)',
          'Kârlılık trendini analiz et',
          'Borçluluk ve likiditeyi değerlendir',
          'Sektör medyanına göre değerleme yap',
        ]
      case 'tablolar':
        return [
          'Bilançoyu yorumla',
          'Gelir tablosunu analiz et',
          'Nakit akışını yorumla',
        ]
      case 'sektor':
        return [
          'Sektördeki konumunu rakipleriyle kıyasla',
          'Sektör medyan rasyolarıyla karşılaştır',
          'Sektördeki liderler arasındaki yerini göster',
        ]
      default:
        return [
          'Teknik analiz raporu hazırla',
          'Finansal rasyoları incele (F/K, PD/DD, ROE)',
          'Sektördeki konumu nedir?',
          'Rakipleriyle karşılaştır',
        ]
    }
  })()

  const stats = quote ? { name: displayName, code: tickerUpper, price: quote.last_price || 0, diffPercent: quote.diff_percent || 0, high: 0, low: 0, open: 0, close: 0, volume: '-' } : null

  if (isError) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`} starterQuestions={starterQuestions}>
        <div className="flex flex-col items-center justify-center min-h-[360px] text-center space-y-4">
          <div className="text-4xl font-bold text-muted-foreground/20">{tickerUpper}</div>
          <p className="text-sm text-muted-foreground">Bu hisse senedi için veri bulunamadı. Hisse kodu hatalı olabilir veya henüz işlem görmüyor olabilir.</p>
        </div>
      </PublicPageLayout>
    )
  }

  if (loading || !stats) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`} starterQuestions={starterQuestions}>
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
      const normalized = dateStr.replace(/\+(\d{2})$/, '+$1:00')
      const d = new Date(normalized)
      if (isNaN(d.getTime())) return null
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } catch { return null }
  }

  return (
    <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`} starterQuestions={starterQuestions}>
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">

        {/* Ticker Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {logoFile ? (
              <img src={`/logos/${logoFile}`} alt={tickerUpper} className="h-9 w-9 rounded-sm object-contain bg-white shrink-0" />
            ) : (
              <div className="h-9 w-9 rounded-sm bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{tickerUpper.slice(0, 2)}</div>
            )}
            <div className="min-w-0 space-y-0.5">
              <span className="text-base text-muted-foreground font-light tracking-tight">{tickerUpper}</span>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">{stats.name}</h1>
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
            <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight block leading-none">
              {stats.price > 0 ? stats.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
            </span>
            <span className={`text-base md:text-lg font-bold inline-flex items-center gap-1 ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
              {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {isUp ? '+' : ''}{stats.diffPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1 -mt-1">
          <div className="flex items-center gap-4">
            <span className="font-medium">Hacim: <span className="text-foreground/70 font-semibold">{formatVol(quote?.volume)}</span></span>
            <span className="flex items-center gap-0.5 text-destructive/70">
              <ChevronDown size={12} />
              <span className="text-foreground/70 font-semibold">{formatPrice(quote?.low_price)}</span>
            </span>
            <span className="flex items-center gap-0.5 text-emerald-500/70">
              <ChevronUp size={12} />
              <span className="text-foreground/70 font-semibold">{formatPrice(quote?.high_price)}</span>
            </span>
          </div>
          {formatTime(quote?.record_date) && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
              <Clock size={14} />
              {formatTime(quote?.record_date)}
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

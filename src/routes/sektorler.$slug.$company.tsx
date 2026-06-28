import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Compass, Table2, Newspaper } from 'lucide-react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { Skeleton } from '../components/ui/skeleton'
import { SLUG_TO_NAME, type CompanyStats } from '../constants/companyShared'

export const Route = createFileRoute('/sektorler/$slug/$company')({
  component: CompanyLayout,
})

const TABS = [
  { suffix: '', label: 'Genel Bakış', icon: Activity },
  { suffix: '/teknik-analiz', label: 'Teknik Analiz', icon: Activity },
  { suffix: '/temel-analiz', label: 'Temel Analiz', icon: Compass },
  { suffix: '/mali-tablolar', label: 'Mali Tablolar', icon: Table2 },
  { suffix: '/haberler', label: 'Haberler', icon: Newspaper },
]

function CompanyLayout() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const sectorName = SLUG_TO_NAME[slug] || slug
  const displayName = (companyNames as Record<string, string>)[tickerUpper] || tickerUpper
  const logoFile = companyLogos[tickerUpper as keyof typeof companyLogos]

  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const chatContext = `sirket:${tickerUpper}`
  const basePath = `/sektorler/${slug}/${company.toLowerCase()}`

  useEffect(() => {
    let isMounted = true
    async function fetchStats() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
      let lastPrice = 0, diffPercent = 0
      try {
        const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/summary-card`)
        if (res.ok) {
          const json = await res.json()
          if (json && !json.error) {
            lastPrice = json.last_price || 0
            diffPercent = json.diff_percent || 0
          }
        }
      } catch (e) { console.error('summary-card fetch failed', e) }
      if (isMounted) {
        setStats({ name: displayName, code: tickerUpper, price: lastPrice, diffPercent, high: 0, low: 0, open: 0, close: 0, volume: '-' })
        setLoading(false)
      }
    }
    fetchStats()
    return () => { isMounted = false }
  }, [tickerUpper, displayName])

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
        {/* Back */}
        <Link to={`/sektorler/${slug}` as any} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          {sectorName}
        </Link>

        {/* Ticker Header */}
        <div className="border border-border/40 bg-card/30 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {logoFile ? (
              <img src={`/logos/${logoFile}`} alt={tickerUpper} className="h-11 w-11 rounded-xl object-cover bg-white p-0 border border-border/30 shadow-3xs shrink-0" />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">{tickerUpper.slice(0, 2)}</div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">{tickerUpper}</span>
              <h1 className="text-base md:text-xl font-bold text-foreground tracking-tight leading-tight truncate mt-0.5">{stats.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight block leading-none">
                {stats.price > 0 ? stats.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
              </span>
              <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1.5 ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{stats.diffPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const to = tab.suffix === '' ? basePath : `${basePath}${tab.suffix}`
            return (
              <Link
                key={to}
                to={to}
                activeProps={{ className: 'bg-primary/15 text-primary border border-primary/20' }}
                inactiveProps={{ className: 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent' }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              >
                <tab.icon size={13} />
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

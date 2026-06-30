import { createFileRoute, Link, Outlet, useNavigate, useMatches } from '@tanstack/react-router'
import { Sparkles, ArrowLeft, Factory, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { SLUG_TO_NAME } from '../constants/companyShared'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'

export const Route = createFileRoute('/sektorler/$slug')({
  component: SektorSlugLayout,
})

function SektorSlugLayout() {
  const matches = useMatches()
  const hasCompanyDetail = matches.some(m => m.routeId === '/sektorler/$slug/$company')

  if (hasCompanyDetail) {
    return <Outlet />
  }
  return <SektorDetailPage />
}

type SectorCompany = {
  ticker: string;
  name: string;
  last_price?: number;
  diff_percent?: number;
  volume?: string;
};

function SektorDetailPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<SectorCompany[]>([])
  const [sectorName, setSectorName] = useState('')
  const [loading, setLoading] = useState(true)

  const chatContext = `sektor:${slug}`

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const name = SLUG_TO_NAME[slug] || slug
    setSectorName(name)

    async function fetchSectorCompanies() {
      const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev"
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"

      try {
        const res = await fetch(`${compUrl}/api/v1/sectors/${encodeURIComponent(name)}/companies`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.companies) {
            const tickerList: string[] = data.companies
              .map((c: any) => c.ticker?.toUpperCase())
              .filter(Boolean)

            const enriched: SectorCompany[] = tickerList.map(ticker => ({
              ticker,
              name: (companyNames as Record<string, string>)[ticker] || ticker,
            }))

            try {
              const priceRes = await fetch(`${apiUrl}/api/market/stocks`)
              if (priceRes.ok) {
                const priceData = await priceRes.json()
                if (priceData && Array.isArray(priceData.data)) {
                  for (const stock of priceData.data) {
                    const item = enriched.find(e => e.ticker === stock.code)
                    if (item) {
                      item.last_price = stock.last_price
                      item.diff_percent = stock.diff_percent
                      item.volume = stock.volume
                    }
                  }
                }
              }
            } catch (e) {
              console.error('Sector detail: price fetch failed:', e)
            }

            // Sort by diff_percent (best performers first)
            enriched.sort((a, b) => (b.diff_percent || 0) - (a.diff_percent || 0))

            if (isMounted) setCompanies(enriched)
          }
        }
      } catch (e) {
        console.error('Sector detail: fetch failed:', e)
      }

      if (isMounted) setLoading(false)
    }

    fetchSectorCompanies()
    return () => { isMounted = false }
  }, [slug])

  if (loading) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}>
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor, lütfen bekleyin...</span>
        </div>
      </PublicPageLayout>
    )
  }

  const upCount = companies.filter(c => (c.diff_percent || 0) > 0).length
  const downCount = companies.filter(c => (c.diff_percent || 0) < 0).length
  const flatCount = companies.length - upCount - downCount

  return (
    <PublicPageLayout
      context={chatContext}
      placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}
    >
      <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

        {/* Back */}
        <Link to="/sektorler" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          Sektörlere Dön
        </Link>

        {/* Sector Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-border/45 bg-card/25 rounded-2xl p-5 gap-4 relative overflow-hidden shrink-0 transition-all hover:border-border/60">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
              <Factory size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sektörler</span>
              <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none mt-1">{sectorName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{companies.length}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Şirket</div>
            </div>
            <div className="flex gap-2">
              <div className="text-center px-3 py-1 rounded-lg bg-emerald-500/10">
                <div className="text-sm font-bold text-emerald-500">{upCount}</div>
                <div className="text-[8px] text-emerald-500/70 font-medium">Yükselen</div>
              </div>
              <div className="text-center px-3 py-1 rounded-lg bg-destructive/10">
                <div className="text-sm font-bold text-destructive">{downCount}</div>
                <div className="text-[8px] text-destructive/70 font-medium">Düşen</div>
              </div>
              {flatCount > 0 && (
                <div className="text-center px-3 py-1 rounded-lg bg-muted/30">
                  <div className="text-sm font-bold text-muted-foreground">{flatCount}</div>
                  <div className="text-[8px] text-muted-foreground/70 font-medium">Düz</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Companies Table - Full Width, Sorted by Performance */}
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
            <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Factory size={12} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sektör Şirketleri</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Performansa göre sıralanmış</span>
          </div>

          <div className="overflow-hidden border border-border/40 rounded-xl bg-muted/10 max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/50 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider border-b border-border/45">
                  <th className="p-3 w-8">#</th>
                  <th className="p-3">Şirket</th>
                  <th className="p-3 text-right">Son Fiyat</th>
                  <th className="p-3 text-right">Değişim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {companies.map((company, idx) => {
                  const compUp = (company.diff_percent || 0) >= 0;
                  const logoFile = companyLogos[company.ticker as keyof typeof companyLogos];
                  return (
                    <tr
                      key={company.ticker}
                      onClick={() => navigate({ to: `/sektorler/${slug}/${company.ticker.toLowerCase()}` })}
                      className="group hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-[10px] text-muted-foreground font-mono">{idx + 1}</td>
                      <td className="p-3 flex items-center gap-2 min-w-0">
                        {logoFile ? (
                          <img src={`/logos/${logoFile}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                        ) : null}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors">{company.ticker}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{company.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-foreground text-right">
                        {company.last_price !== undefined
                          ? `${company.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                          : '-'}
                      </td>
                      <td className="p-3 text-right">
                        {company.last_price !== undefined ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            compUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {compUp ? '+' : ''}{(company.diff_percent || 0).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PublicPageLayout>
  )
}

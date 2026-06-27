import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, Building2, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import tickerToSectorSlug from '../constants/tickerToSectorSlug'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'

export const Route = createFileRoute('/sirketler')({
  component: SirketlerPage,
})

type CompanyRow = {
  ticker: string;
  name: string;
  sector?: string;
  last_price?: number;
  diff_percent?: number;
};

const BIST30_TICKERS = [
  'KRDMD', 'MGROS', 'PETKM', 'PGSUS', 'SAHOL',
  'SASA', 'SISE', 'TAVHL', 'TCELL', 'THYAO',
  'TOASO', 'TRALT', 'TTKOM', 'TUPRS', 'VAKBN', 'YKBNK',
  'AKBNK', 'ARCLK', 'ASELS', 'BIMAS', 'DOHOL',
  'EKGYO', 'ENKAI', 'EREGL', 'FROTO', 'GARAN',
  'HALKB', 'ISCTR', 'KCHOL', 'KOZAL', 'KOZAA',
]

function SirketlerPage() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [topGainers, setTopGainers] = useState<CompanyRow[]>([])
  const [topLosers, setTopLosers] = useState<CompanyRow[]>([])

  useEffect(() => {
    let isMounted = true

    async function fetchCompanies() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"

      const rows: CompanyRow[] = BIST30_TICKERS.map(ticker => ({
        ticker,
        name: (companyNames as Record<string, string>)[ticker] || ticker,
      }))

      try {
        const priceRes = await fetch(`${apiUrl}/api/market/stocks`)
        if (priceRes.ok) {
          const priceData = await priceRes.json()
          if (priceData && Array.isArray(priceData.data)) {
            for (const stock of priceData.data) {
              const row = rows.find(r => r.ticker === stock.code?.toUpperCase())
              if (row) {
                const lastPrice = typeof stock.last_price === 'number' ? stock.last_price : parseFloat(stock.last_price) || undefined
                const diffPercent = typeof stock.diff_percent === 'number' ? stock.diff_percent : parseFloat(stock.diff_percent) || 0
                row.last_price = lastPrice
                row.diff_percent = diffPercent
              }
            }
          }
        }
      } catch (e) {
        console.error('Şirketler: Failed fetching prices:', e)
      }

      if (isMounted) {
        const sorted = rows.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
        setCompanies(sorted)

        const withPrices = sorted.filter(r => r.last_price !== undefined)
        const gainers = [...withPrices].sort((a, b) => (b.diff_percent || 0) - (a.diff_percent || 0)).slice(0, 5)
        const losers = [...withPrices].sort((a, b) => (a.diff_percent || 0) - (b.diff_percent || 0)).slice(0, 5)
        setTopGainers(gainers)
        setTopLosers(losers)

        setLoading(false)
      }
    }

    fetchCompanies()
    return () => { isMounted = false }
  }, [])

  const filteredCompanies = companies.filter(c =>
    c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  return (
    <PublicPageLayout context="sirketler" placeholder="Şirketler hakkında bir soru sorun...">
      <div className="space-y-8 animate-in fade-in duration-400">

        {/* En Çok Yükselenler & Düşenler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* En Çok Yükselenler */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ArrowUpCircle size={14} className="text-emerald-500" />
                <span>En Çok Yükselenler</span>
              </h3>
            </div>
            <div className="border border-emerald-500/10 rounded-2xl bg-card/15 overflow-hidden shadow-3xs backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider bg-emerald-500/5">
                      <th className="py-2.5 px-4">Hisse</th>
                      <th className="py-2.5 px-3">Adı</th>
                      <th className="py-2.5 px-3 text-right">Fiyat</th>
                      <th className="py-2.5 px-4 text-right">Değişim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {topGainers.map((row) => (
                      <tr 
                        key={row.ticker}
                        onClick={() => navigate({ to: `/sektorler/${tickerToSectorSlug[row.ticker] || 'diger'}/${row.ticker.toLowerCase()}` })}
                        className="group hover:bg-emerald-500/5 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-bold font-mono text-[11px] tracking-tight text-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 group-hover:border-emerald-500/25 group-hover:text-emerald-500 transition-all">
                            {row.ticker}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-muted-foreground max-w-[120px] truncate">
                          <div className="flex items-center gap-2">
                            {companyLogos[row.ticker as keyof typeof companyLogos] ? (
                              <img src={`/logos/${companyLogos[row.ticker as keyof typeof companyLogos]}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                            ) : null}
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold font-mono tracking-tight text-foreground">
                          {row.last_price !== undefined ? `${row.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-0.5 font-bold font-mono tracking-tight text-[11px] text-emerald-500">
                            ▲ +{(row.diff_percent || 0).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* En Çok Düşenler */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-destructive" />
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ArrowDownCircle size={14} className="text-destructive" />
                <span>En Çok Düşenler</span>
              </h3>
            </div>
            <div className="border border-destructive/10 rounded-2xl bg-card/15 overflow-hidden shadow-3xs backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider bg-destructive/5">
                      <th className="py-2.5 px-4">Hisse</th>
                      <th className="py-2.5 px-3">Adı</th>
                      <th className="py-2.5 px-3 text-right">Fiyat</th>
                      <th className="py-2.5 px-4 text-right">Değişim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {topLosers.map((row) => (
                      <tr 
                        key={row.ticker}
                        onClick={() => navigate({ to: `/sektorler/${tickerToSectorSlug[row.ticker] || 'diger'}/${row.ticker.toLowerCase()}` })}
                        className="group hover:bg-destructive/5 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-bold font-mono text-[11px] tracking-tight text-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-destructive/5 border border-destructive/10 group-hover:border-destructive/25 group-hover:text-destructive transition-all">
                            {row.ticker}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-muted-foreground max-w-[120px] truncate">
                          <div className="flex items-center gap-2">
                            {companyLogos[row.ticker as keyof typeof companyLogos] ? (
                              <img src={`/logos/${companyLogos[row.ticker as keyof typeof companyLogos]}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                            ) : null}
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold font-mono tracking-tight text-foreground">
                          {row.last_price !== undefined ? `${row.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-0.5 font-bold font-mono tracking-tight text-[11px] text-destructive">
                            ▼ {(row.diff_percent || 0).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Şirketler</h1>
          <p className="text-muted-foreground text-sm mt-1">Borsa İstanbul'un öne çıkan şirketleri (BIST 30)</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Şirket ara (örn: THYAO, Garanti...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-card border border-border/50 rounded-xl text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Companies List */}
        {filteredCompanies.length > 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="divide-y divide-border/30">
              {filteredCompanies.map((company) => {
                const logoFile = companyLogos[company.ticker as keyof typeof companyLogos]
                const isUp = (company.diff_percent || 0) >= 0

                return (
                  <Link
                    key={company.ticker}
                    to="/sektorler/$slug/$company"
                    params={{ slug: tickerToSectorSlug[company.ticker] || 'diger', company: company.ticker.toLowerCase() }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {logoFile ? (
                        <div className="h-9 w-9 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          <img src={`/logos/${logoFile}`} alt={company.ticker} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {company.ticker}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{company.ticker}</div>
                        <div className="text-xs text-muted-foreground truncate">{company.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {company.last_price !== undefined && (
                        <div className="text-right">
                          <div className="text-sm font-semibold tabular-nums">{company.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                          <div className={`text-xs font-medium ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
                            {isUp ? '+' : ''}{(company.diff_percent || 0).toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border/50 rounded-2xl">
            {searchQuery ? `"${searchQuery}" ile eşleşen şirket bulunamadı.` : 'Şirket listesi yüklenemedi.'}
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}

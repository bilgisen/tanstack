import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, Building2, Search, ArrowLeft } from 'lucide-react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'

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

function SirketlerPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    async function fetchCompanies() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
      const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev"

      // Get all companies from comp API
      let tickerList: string[] = []
      try {
        const compRes = await fetch(`${compUrl}/api/v1/companies`)
        if (compRes.ok) {
          const compData = await compRes.json()
          if (compData && compData.companies) {
            tickerList = compData.companies.map((c: any) => c.ticker?.toUpperCase()).filter(Boolean)
          }
        }
      } catch (e) {
        console.error('Şirketler: Failed fetching companies list:', e)
        // Fallback to companyNames.json
        tickerList = Object.keys(companyNames)
      }

      // Build company rows
      const rows: CompanyRow[] = tickerList.map(ticker => ({
        ticker,
        name: (companyNames as Record<string, string>)[ticker] || ticker,
      }))

      // Try to get prices in batch
      try {
        const priceRes = await fetch(`${apiUrl}/api/market/stocks`)
        if (priceRes.ok) {
          const priceData = await priceRes.json()
          if (priceData && Array.isArray(priceData.data)) {
            for (const stock of priceData.data) {
              const row = rows.find(r => r.ticker === stock.code)
              if (row) {
                row.last_price = stock.last_price
                row.diff_percent = stock.diff_percent
              }
            }
          }
        }
      } catch (e) {
        console.error('Şirketler: Failed fetching prices:', e)
      }

      if (isMounted) {
        setCompanies(rows.sort((a, b) => a.name.localeCompare(b.name, 'tr')))
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
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Şirketler</h1>
        <p className="text-muted-foreground text-sm mt-1">Borsa İstanbul'daki tüm şirketler ({companies.length})</p>
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
                  to="/panel/sirketler/$id"
                  params={{ id: company.ticker.toLowerCase() }}
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
  )
}

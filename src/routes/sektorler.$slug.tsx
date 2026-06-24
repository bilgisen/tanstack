import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, Factory, ArrowLeft } from 'lucide-react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'

export const Route = createFileRoute('/sektorler/$slug')({
  component: SektorDetailPage,
})

const SLUG_TO_NAME: Record<string, string> = {
  'saglik-ilac': 'Sağlık & İlaç',
  'gida-icecek-tarim': 'Gıda & İçecek & Tarım',
  'diger': 'Diğer',
  'sanayi-metal-kimya': 'Sanayi & Metal & Kimya',
  'holdingler': 'Holdingler',
  'gyo-gayrimenkul': 'GYO (Gayrimenkul)',
  'otomotiv-savunma-makine': 'Otomotiv & Savunma & Makine',
  'turizm-medya-eglence': 'Turizm & Medya & Eğlence',
  'sigortacilik': 'Sigortacılık',
  'ulasim-lojistik': 'Ulaştırma & Lojistik',
  'tuketim-perakende-tekstil': 'Tüketim & Perakende & Tekstil',
  'insaat-yapi-malzemeleri': 'İnşaat & Yapı Malzemeleri',
  'spor': 'Spor',
  'bankacilik-finans': 'Bankacılık & Finans',
  'enerji-uretim-dagitim-petrol': 'Enerji (Üretim + Dağıtım + Petrol)',
  'teknoloji-iletisim': 'Teknoloji & İletişim',
}

type SectorCompany = {
  ticker: string;
  name: string;
  last_price?: number;
  diff_percent?: number;
};

function SektorDetailPage() {
  const { slug } = Route.useParams()
  const [companies, setCompanies] = useState<SectorCompany[]>([])
  const [sectorName, setSectorName] = useState('')
  const [loading, setLoading] = useState(true)

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

            // Fetch prices in batch
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
                    }
                  }
                }
              }
            } catch (e) {
              console.error('Sector detail: price fetch failed:', e)
            }

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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Back */}
      <Link to="/sektorler" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} />
        Sektörlere Dön
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Factory size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{sectorName}</h1>
            <p className="text-muted-foreground text-sm">{companies.length} şirket</p>
          </div>
        </div>
      </div>

      {/* Companies List */}
      {companies.length > 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="divide-y divide-border/30">
            {companies.map((company) => {
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
          Bu sektör için şirket bulunamadı.
        </div>
      )}
    </div>
  )
}

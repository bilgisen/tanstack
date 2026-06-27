import { createFileRoute, Link } from '@tanstack/react-router'
import { Sparkles, HelpCircle, ArrowLeft, Factory, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useChatStore } from '../store/chat'

export const Route = createFileRoute('/sektorler/$slug/$company')({
  component: CompanyDetailPage,
})

type CompanyStats = {
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: string;
  sector: string;
};

function CompanyDetailPage() {
  const { slug, company } = Route.useParams()
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useChatStore()

  const chatContext = `sirket:${company.toUpperCase()}`
  const sectorName = SLUG_TO_NAME[slug] || slug

  const baseUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchCompanyDetails() {
      try {
        const res = await fetch(`${baseUrl}/api/market/symbol/${company.toUpperCase()}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.success && data.data) {
            const item = data.data
            const lastPrice = typeof item.last_price === 'number' ? item.last_price : parseFloat(item.last_price) || 0
            const diffPercent = typeof item.diff_percent === 'number' ? item.diff_percent : parseFloat(item.diff_percent) || 0

            if (isMounted) {
              setCompanyStats({
                name: (companyNames as Record<string, string>)[company.toUpperCase()] || company,
                code: company.toUpperCase(),
                price: lastPrice,
                diffPercent: diffPercent,
                high: typeof item.high === 'number' ? item.high : lastPrice * 1.02,
                low: typeof item.low === 'number' ? item.low : lastPrice * 0.98,
                open: typeof item.open === 'number' ? item.open : lastPrice * 0.99,
                close: typeof item.close === 'number' ? item.close : lastPrice,
                volume: item.volume || "50.0M ₺",
                sector: sectorName
              })
            }
          }
        }
      } catch (e) {
        console.error('Company detail: failed fetching data', e)
        if (isMounted) {
          setCompanyStats({
            name: (companyNames as Record<string, string>)[company.toUpperCase()] || company,
            code: company.toUpperCase(),
            price: 120.50,
            diffPercent: 1.85,
            high: 122.30,
            low: 119.10,
            open: 119.80,
            close: 120.20,
            volume: "45.2M ₺",
            sector: sectorName
          })
        }
      }

      if (isMounted) setLoading(false)
    }

    fetchCompanyDetails()
    return () => { isMounted = false }
  }, [slug, company])

  if (loading || !companyStats) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${companyStats?.code || company} hakkında bir soru sorun...`}>
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor, lütfen bekleyin...</span>
        </div>
      </PublicPageLayout>
    )
  }

  const isUp = companyStats.diffPercent >= 0

  return (
    <PublicPageLayout context={chatContext} placeholder={`${companyStats.code} hakkında bir soru sorun...`}>
      <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

        {/* Back */}
        <Link to={`/sektorler/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          {sectorName} Sektörüne Dön
        </Link>

        {/* SECTION A: Company Heading Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-border/45 bg-card/25 rounded-2xl p-5 gap-4 relative overflow-hidden shrink-0 transition-all hover:border-border/60">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
              <Factory size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Şirketler</span>
              <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none mt-1">{companyStats.code}</h1>
              <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">{companyStats.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">Sektör</span>
              <div className="text-sm font-semibold text-foreground mt-0.5">{companyStats.sector}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">Fiyat</span>
              <div className="text-2xl font-bold text-foreground tracking-tight mt-0.5">{companyStats.price.toFixed(2)} ₺</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-medium uppercase">Değişim</span>
              <div className={`text-sm font-bold mt-0.5 ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>{isUp ? '+' : ''}{companyStats.diffPercent.toFixed(2)}%</div>
            </div>
          </div>
        </div>

        <div className="text-center py-12 text-muted-foreground bg-card/20 rounded-2xl border border-border/40">
          <Factory size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold mb-2">Şirket Detay Sayfası</h3>
          <p className="text-sm mb-4">Tekil şirket bilgileri burada görüntülenecek.</p>
          <p className="text-xs text-muted-foreground/60">Slug: {slug} | Şirket: {company}</p>
        </div>

      </div>
    </PublicPageLayout>
  )
}

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
};
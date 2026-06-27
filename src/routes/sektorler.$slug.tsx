import { createFileRoute, Link, useNavigate, Outlet, useMatches } from '@tanstack/react-router'
import { Sparkles, HelpCircle, ArrowLeft, Factory, Loader2, TrendingUp, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useChatStore } from '../store/chat'

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
  volume?: string;
};

function SektorDetailPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<SectorCompany[]>([])
  const [sectorName, setSectorName] = useState('')
  const [sectorSummary, setSectorSummary] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useChatStore()

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

  // Sektör özeti hesaplaması - companies state'i güncellendiğinde otomatik hesaplanır
  useEffect(() => {
    if (loading) return // Loading bitene kadar özet hesaplama

    const avgDiff = companies.length > 0
      ? companies.reduce((sum, c) => sum + (c.diff_percent || 0), 0) / companies.length
      : 0
    
    setSectorSummary([
      `**${sectorName}** sektöründe toplam **${companies.length}** şirket bulunmaktadır.`,
      `Sektör ortalaması bugün **${avgDiff >= 0 ? '+' : ''}${avgDiff.toFixed(2)}%** değişim göstermektedir.`
    ])
  }, [companies, sectorName, loading])

  const technicalQuestions = [
    `${sectorName} sektöründeki en çok yükselen şirketler hangileri?`,
    `${sectorName} sektörü teknik olarak hangi trendde?`,
    `${sectorName} sektöründe destek ve direnç seviyeleri nerede?`,
    `${sectorName} sektörü için RSI ve MACD sinyalleri ne gösteriyor?`,
    `${sectorName} sektöründe hacim bazlı momentum analizi yapar mısın?`
  ]

  const fundamentalQuestions = [
    `${sectorName} sektörünün ortalama F/K oranı kaç?`,
    `${sectorName} PD/DD oranına göre ucuz kalan şirketler hangileri?`,
    `${sectorName} sektöründeki şirketlerin temel karşılaştırmasını yapar mısın?`,
    `${sectorName} sektörüne yatırım yapmak mantıklı mı?`,
    `${sectorName} sektöründeki şirketlerin bilanço kalitesi nasıl?`
  ]

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

        {/* SECTION A: Sector Heading Block */}
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

        {/* SECTION B: AI Summary */}
        {sectorSummary.length > 0 && (
          <div className="border border-border/40 bg-muted/15 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary animate-pulse" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sektör Özeti</h3>
            </div>
            <div className="text-xs md:text-sm text-foreground/80 leading-relaxed space-y-2.5">
              {sectorSummary.map((p, idx) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
              ))}
            </div>
          </div>
        )}

        {/* SECTION C: Dual Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* COLUMN 1: Companies Table */}
          <div className="border border-border/45 bg-card/20 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Factory size={12} />
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sektör Şirketleri</h3>
              </div>

              <div className="overflow-hidden border border-border/40 rounded-xl bg-muted/10 max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-muted/50 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider border-b border-border/45">
                      <th className="p-3">Şirket</th>
                      <th className="p-3">Son Fiyat</th>
                      <th className="p-3 text-right">Değişim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {companies.map((company) => {
                      const compUp = (company.diff_percent || 0) >= 0;
                      const logoFile = companyLogos[company.ticker as keyof typeof companyLogos];
                      return (
                        <tr
                          key={company.ticker}
                          onClick={() => navigate({ to: `/panel/sirketler/${company.ticker.toLowerCase()}` as any })}
                          className="group hover:bg-muted/40 cursor-pointer transition-colors"
                        >
                          <td className="p-3 flex items-center gap-2 min-w-0">
                            {logoFile ? (
                              <img src={`/logos/${logoFile}`} className="w-4 h-4 object-contain rounded-full bg-white p-0.5 border border-border/40 shrink-0 shadow-3xs" alt="" />
                            ) : null}
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors">{company.ticker}</span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{company.name}</span>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-foreground">
                            {company.last_price !== undefined
                              ? `${company.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                              : '-'}
                          </td>
                          <td className="p-3 text-right">
                            {company.last_price !== undefined && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                compUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                              }`}>
                                {compUp ? '+' : ''}{(company.diff_percent || 0).toFixed(2)}%
                              </span>
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

          {/* COLUMN 2: Suggested Questions */}
          <div className="border border-border/45 bg-card/20 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              {/* Technical Questions */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp size={12} />
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Teknik Analiz Soruları</h3>
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                {technicalQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      if (window.innerWidth < 1024) {
                        window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                      }
                      await sendMessage(q, chatContext);
                    }}
                    className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Fundamental Questions */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Globe size={12} />
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Temel Analiz Soruları</h3>
              </div>
              <div className="flex flex-col gap-1.5">
                {fundamentalQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      if (window.innerWidth < 1024) {
                        window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                      }
                      await sendMessage(q, chatContext);
                    }}
                    className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </PublicPageLayout>
  )
}

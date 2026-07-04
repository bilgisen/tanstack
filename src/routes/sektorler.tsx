import { createFileRoute, Link, Outlet, useMatches } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, ChevronRight, Factory, HelpCircle } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useChatStore } from '../store/chat'
import { toSlug } from '../constants/companyShared'

export const Route = createFileRoute('/sektorler')({
  component: SektorlerPage,
})

type Industry = {
  slug: string;
  name: string;
  companyCount: number;
  activeCompanies: number;
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
};

function SektorlerPage() {
  const matches = useMatches()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useChatStore()

  // If there's a child route (e.g., /sektorler/holdingler), render the Outlet
  const hasChildRoute = matches.some(m => m.routeId === '/sektorler/$slug' || m.routeId === '/sektorler/$slug/$company')

  useEffect(() => {
    if (hasChildRoute) return // Don't fetch if showing child route
    
    let isMounted = true
    setLoading(true)

    async function fetchIndustries() {
      const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev"
      try {
        // Use NEW industries endpoint
        const res = await fetch(`${compUrl}/api/v1/sectors/industries`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.industries) {
            const industryList = data.industries.map((ind: any) => ({
              slug: ind.slug,
              name: ind.name,
              companyCount: ind.total_companies || 0,
              activeCompanies: ind.active_companies || 0,
              reliability: ind.reliability || 'LOW',
            }))
            if (isMounted) setIndustries(industryList)
          }
        }
      } catch (e) {
        console.error('Sektörler: Failed fetching industries:', e)
      }
      if (isMounted) setLoading(false)
    }

    fetchIndustries()
    return () => { isMounted = false }
  }, [hasChildRoute])

  const sectorQuestions = [
    'Borsa İstanbul\'da en çok yükselen sektörler hangileri?',
    'Sektörel bazda hangi gruplar daha güçlü?',
    'Sektörler arasında para akışı analizi yapabilir misin?',
    'Hangi sektörler şu anda düşüş trendinde?',
    'Sektörel bazda temel analiz karşılaştırması yapar mısın?'
  ]

  const totalCompanies = industries.reduce((sum, ind) => sum + ind.companyCount, 0)
  const highQualityCount = industries.filter(ind => ind.reliability === 'HIGH').length

  // Reliability badge component
  const ReliabilityBadge = ({ reliability }: { reliability: string }) => {
    const colors = {
      HIGH: 'bg-green-500/10 text-green-600 border-green-500/20',
      MEDIUM: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      LOW: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    }
    const labels = {
      HIGH: 'Yüksek Güvenilirlik',
      MEDIUM: 'Orta Güvenilirlik',
      LOW: 'Düşük Güvenilirlik',
    }
    return (
      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${colors[reliability as keyof typeof colors] || colors.LOW}`}>
        {labels[reliability as keyof typeof labels] || reliability}
      </span>
    )
  }

  // If showing child route, render Outlet instead of list
  if (hasChildRoute) {
    return <Outlet />
  }

  return (
    <PublicPageLayout context="sektorler" placeholder="Sektörler hakkında bir soru sorun...">

      {loading ? (
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor...</span>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border border-border/45 bg-card/25 rounded-2xl p-5 gap-4 relative overflow-hidden shrink-0 transition-all hover:border-border/60">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                <Factory size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sektörler</span>
                <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none mt-1">Borsa İstanbul Sektörleri</h1>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{industries.length}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Industry</div>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-green-600 tracking-tight">{highQualityCount}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Yüksek Kalite</div>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{totalCompanies}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Şirket</div>
              </div>
            </div>
          </div>

          {/* Industry Grid - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {industries.map((industry) => (
              <Link
                key={industry.slug}
                to="/sektorler/$slug"
                params={{ slug: industry.slug }}
                className="group flex items-center justify-between border border-border/45 bg-card/25 rounded-2xl p-5 transition-all hover:border-primary/30 hover:bg-card/40 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                    <Factory size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{industry.name}</h3>
                      <ReliabilityBadge reliability={industry.reliability} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {industry.companyCount} şirket · {industry.activeCompanies} skorlu
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-2" />
              </Link>
            ))}
          </div>

          {/* Suggested Questions */}
          <div className="border border-border/45 bg-card/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
              <HelpCircle size={12} />
              <span>Önerilen Sektör Analiz Soruları</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sectorQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={async () => {
                    if (window.innerWidth < 1024) {
                      window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                    }
                    await sendMessage(q, 'sektorler');
                  }}
                  className="text-left text-xs text-muted-foreground hover:bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {industries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Industry verisi yüklenemedi.
            </div>
          )}
        </div>
      )}

    </PublicPageLayout>
  )
}

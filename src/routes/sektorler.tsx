import { createFileRoute, Link, Outlet, useMatches } from '@tanstack/react-router'
import { Loader2, ChevronRight, Factory } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useChatStore } from '../store/chat'
import { useIndustries } from '../lib/useCompanyData'


export const Route = createFileRoute('/sektorler')({
  component: SektorlerPage,
})

function SektorlerPage() {
  const matches = useMatches()
  const { data: industriesRaw, isLoading: loading } = useIndustries()
  const { sendMessage } = useChatStore()

  const hasChildRoute = matches.some(m => m.routeId === '/sektorler/$slug')

  const industries: Industry[] = (industriesRaw?.data || [])
    .filter((ind: any) => ind.slug !== 'diger' && ind.slug !== 'other')
    .map((ind: any) => ({
      slug: ind.slug,
      name: ind.name,
      companyCount: ind.companyCount || 0,
      activeCompanies: ind.activeCompanies || 0,
      reliability: ind.reliability || 'LOW',
    }))

  const totalCompanies = industries.reduce((sum, ind) => sum + ind.companyCount, 0)
  const highQualityCount = industries.filter(ind => ind.reliability === 'HIGH').length

  // Reliability badge component
  const ReliabilityBadge = ({ reliability }: { reliability: string }) => {
    const dotColors = {
      HIGH: 'bg-green-500',
      MEDIUM: 'bg-orange-500',
      LOW: 'bg-red-500',
    }
    const tooltips = {
      HIGH: '',
      MEDIUM: 'Orta güvenilirlik: şirket sayısı medyan hesaplama için yeterli ancak optimal değil',
      LOW: 'Düşük güvenilirlik: şirket sayısı güvenilir sektör medyanı hesaplamak açısından yeterli değildir',
    }
    
    const dotColor = dotColors[reliability as keyof typeof dotColors] || dotColors.LOW
    const tooltip = tooltips[reliability as keyof typeof tooltips] || ''
    
    return (
      <span 
        className="inline-flex items-center gap-1"
        title={tooltip}
      >
        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
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
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Sektör</div>
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

import { Link, Outlet, createFileRoute, useMatches, useNavigate } from '@tanstack/react-router'
import { Building2, ChevronRight, Loader2 } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useSectorGroups } from '../lib/useCompData'
import { groupKeyToDisplayName, sectorNameToSlug, slugToGroupKey } from '../constants/sectorGroups'
import { SectorDonutChart } from '../components/sectors/SectorDonutChart'

export const Route = createFileRoute('/sektorler/$slug')({
  component: SektorGroupLayout,
})

function SektorGroupLayout() {
  const matches = useMatches()
  const hasSectorChild = matches.some(m => m.routeId === '/sektorler/$slug/$sectorSlug')
  if (hasSectorChild) return <Outlet />
  return <SektorGroupPage />
}

function SektorGroupPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const groupKey = slugToGroupKey(slug) || slug
  const displayName = groupKeyToDisplayName(groupKey) || slug

  const { data: groupsData, isLoading: loading } = useSectorGroups()

  const sectorList = (groupsData?.sectors || [])
    .filter(s => s.consolidated === groupKey && s.sector_main !== displayName)
    .sort((a, b) => (b.cnt || 0) - (a.cnt || 0))

  const totalCompanies = sectorList.reduce((sum, s) => sum + (s.cnt || 0), 0)

  const chatContext = `sector-group:${slug}`

  const handleItemClick = (item: { name: string }) => {
    const found = sectorList.find(s => s.sector_main === item.name)
    if (found) {
      navigate({ to: '/sektorler/$slug/$sectorSlug', params: { slug, sectorSlug: sectorNameToSlug(found.sector_main) } })
    }
  }

  if (loading) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${displayName} hakkında bir soru sorun...`}>
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor, lütfen bekleyin...</span>
        </div>
      </PublicPageLayout>
    )
  }

  return (
    <PublicPageLayout context={chatContext} placeholder={`${displayName} hakkında bir soru sorun...`}>
      <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
          <Link to="/sektorler" className="transition-colors hover:text-foreground">Sektörler</Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{displayName}</span>
        </nav>

        <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none">{displayName}</h1>

        {/* Alt sektör dağılımı - donut + tıklanabilir etiketler */}
        {sectorList.length > 0 && (
          <div className="rounded-2xl border border-border/10 bg-card/60 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/20">
              <Building2 size={14} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Alt Sektörler</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">Dağılım</span>
            </div>
            <SectorDonutChart
              data={sectorList.map(s => ({ name: s.sector_main, value: s.cnt || 0 }))}
              onItemClick={handleItemClick}
              legendColumns="grid-cols-2"
              showLegendValues={false}
              centerLabel={{ value: String(totalCompanies), label: 'Şirket' }}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Alt sektöre gitmek için dilimi tıklayın.
            </p>
          </div>
        )}

        {sectorList.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Bu sektör grubu için veri bulunamadı.
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}
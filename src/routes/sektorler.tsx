import { Outlet, createFileRoute, useMatches, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useSectorGroups } from '../lib/useCompData'
import { SECTOR_GROUPS, getGroupColor, groupKeyToDisplayName, groupKeyToSlug } from '../constants/sectorGroups'
import { SectorDonutChart } from '../components/sectors/SectorDonutChart'
import type { SectorGroupsResponse } from '../lib/useCompData'

type SectorGroupItem = SectorGroupsResponse['groups'][number]

export const Route = createFileRoute('/sektorler')({
  component: SektorlerPage,
})

function SektorlerPage() {
  const matches = useMatches()
  const navigate = useNavigate()
  const { data, isLoading: loading } = useSectorGroups()
  const hasChildRoute = matches.some(m => m.routeId === '/sektorler/$slug')

  const groups: Array<SectorGroupItem> = (data?.groups || Object.entries(SECTOR_GROUPS).map(([key, name]) => ({ key, name, count: 0 })))
    .sort((a, b) => (b.count || 0) - (a.count || 0))

  const totalCompanies = groups.reduce((sum, g) => sum + (g.count || 0), 0)

  if (hasChildRoute) {
    return <Outlet />
  }

  const pieData = groups.map(g => ({
    name: groupKeyToDisplayName(g.key) || g.name,
    value: g.count || 0,
    color: getGroupColor(g.key),
  }))

  const handleItemClick = (item: { name: string }) => {
    const found = groups.find(g => (groupKeyToDisplayName(g.key) || g.name) === item.name)
    if (found) {
      navigate({ to: '/sektorler/$slug', params: { slug: groupKeyToSlug(found.key) } })
    }
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

          <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none">Borsa İstanbul Sektörleri</h1>

          <div className="rounded-2xl border border-border/10 bg-card/60 p-4 md:p-6">
            <SectorDonutChart
              data={pieData}
              onItemClick={handleItemClick}
              legendColumns="grid-cols-2"
              showLegendValues={false}
              centerLabel={{ value: String(totalCompanies), label: 'Şirket' }}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Gruba gitmek için dilimi tıklayın.
            </p>
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Sektör verisi yüklenemedi.</div>
          )}
        </div>
      )}
    </PublicPageLayout>
  )
}
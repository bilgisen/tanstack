import { createFileRoute, Link, Outlet, useMatches } from '@tanstack/react-router'
import { Loader2, ChevronRight, Factory } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useSectorGroups } from '../lib/useCompData'
import { groupKeyToSlug, groupKeyToDisplayName, SECTOR_GROUPS } from '../constants/sectorGroups'

export const Route = createFileRoute('/sektorler')({
  component: SektorlerPage,
})

function SektorlerPage() {
  const matches = useMatches()
  const { data, isLoading: loading } = useSectorGroups()
  const hasChildRoute = matches.some(m => m.routeId === '/sektorler/$slug')

  const groups = (data?.groups || Object.entries(SECTOR_GROUPS).map(([key, name]) => ({
    key, name, count: 0
  }))).sort((a: any, b: any) => (b.count || 0) - (a.count || 0))

  const totalCompanies = groups.reduce((sum: number, g: any) => sum + (g.count || 0), 0)

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-12 w-12 bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                <Factory size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sektör Grupları</span>
                <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none mt-1">Borsa İstanbul Sektörleri</h1>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{groups.length}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Grup</div>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{totalCompanies}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Şirket</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group: any) => {
              const displayName = groupKeyToDisplayName(group.key) || group.name
              const slug = groupKeyToSlug(group.key)
              return (
                <Link
                  key={group.key}
                  to="/sektorler/$slug"
                  params={{ slug }}
                  className="group flex items-center justify-between transition-all hover:bg-muted/20 cursor-pointer px-1 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                      <Factory size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{displayName}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {group.count || '—'} şirket
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-2" />
                </Link>
              )
            })}
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Sektör verisi yüklenemedi.
            </div>
          )}
        </div>
      )}
    </PublicPageLayout>
  )
}

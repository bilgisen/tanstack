import { Link, Outlet, createFileRoute, useMatches } from '@tanstack/react-router'
import { ChevronRight, Factory, Loader2 } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import {  useSectorGroups } from '../lib/useCompData'
import { SECTOR_GROUPS, groupKeyToDisplayName, groupKeyToSlug } from '../constants/sectorGroups'
import type {SectorGroupsResponse} from '../lib/useCompData';

type SectorGroupItem = SectorGroupsResponse['groups'][number]

export const Route = createFileRoute('/sektorler')({
  component: SektorlerPage,
})

const GROUP_COLORS = [
  '#494fdf', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#f43f5e', '#0ea5e9', '#f97316', '#14b8a6', '#64748b',
  '#e11d48', '#6366f1', '#d946ef', '#84cc16', '#78716c',
]

function SektorlerPage() {
  const matches = useMatches()
  const { data, isLoading: loading } = useSectorGroups()
  const hasChildRoute = matches.some(m => m.routeId === '/sektorler/$slug')

  const groups: Array<SectorGroupItem> = (data?.groups || Object.entries(SECTOR_GROUPS).map(([key, name]) => ({
    key, name, count: 0
  }))).sort((a, b) => (b.count || 0) - (a.count || 0))

  const totalCompanies = groups.reduce((sum, g) => sum + (g.count || 0), 0)

  if (hasChildRoute) {
    return <Outlet />
  }

  const pieData = groups.map(g => ({
    name: groupKeyToDisplayName(g.key) || g.name,
    nameTr: groupKeyToDisplayName(g.key) || g.name,
    value: g.count || 0,
  }))

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
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center text-primary shrink-0">
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

          {totalCompanies > 0 && (
            <div className="flex flex-col md:flex-row items-center gap-8 pb-4 border-b border-border/20">
              <div className="w-full max-w-[220px] shrink-0">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={1.5} strokeWidth={0}>
                      {pieData.filter(d => d.value > 0).map((_, i) => (
                        <Cell key={i} fill={GROUP_COLORS[i % GROUP_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${val} şirket`} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
                {pieData.filter(d => d.value > 0).slice(0, 12).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    <span className="inline-block w-2 h-2 shrink-0" style={{ backgroundColor: GROUP_COLORS[i % GROUP_COLORS.length] }} />
                    <span className="text-muted-foreground truncate text-xs">{item.nameTr}</span>
                    <span className="font-mono font-semibold tabular-nums text-foreground text-xs ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {groups.map(group => {
              const displayName = groupKeyToDisplayName(group.key) || group.name
              const slug = groupKeyToSlug(group.key)
              return (
                <Link
                  key={group.key}
                  to="/sektorler/$slug"
                  params={{ slug }}
                  className="group flex items-center justify-between transition-all hover:bg-muted/20 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                      <Factory size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{displayName}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{group.count || '—'} şirket</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-2" />
                </Link>
              )
            })}
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Sektör verisi yüklenemedi.</div>
          )}
        </div>
      )}
    </PublicPageLayout>
  )
}

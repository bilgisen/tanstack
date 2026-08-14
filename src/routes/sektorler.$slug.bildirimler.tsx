import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { SektorBildirimlerList } from '../components/sectors/SektorBildirimlerList'
import { SektorTabs } from '../components/sectors/SektorTabs'
import { GROUP_TO_SINGLE_SECTOR, getSectorNameFromSlug, groupKeyToDisplayName, slugToGroupKey } from '../constants/sectorGroups'

export const Route = createFileRoute('/sektorler/$slug/bildirimler')({
  component: SektorGroupBildirimlerPage,
})

function SektorGroupBildirimlerPage() {
  const { slug } = Route.useParams()
  const groupKey = slugToGroupKey(slug) || slug
  const displayName = groupKeyToDisplayName(groupKey) || slug
  const sectorName = GROUP_TO_SINGLE_SECTOR[groupKey] || getSectorNameFromSlug(slug)

  return (
    <PublicPageLayout context={`sector:${sectorName}`} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}>
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
          <Link to="/sektorler" className="transition-colors hover:text-foreground">Sektörler</Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{displayName}</span>
        </nav>

        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary shrink-0" />
          <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none">{displayName}</h1>
        </div>

        {/* Tabs */}
        <SektorTabs basePath={`/sektorler/${slug}`} />

        {/* Bildirimler */}
        <SektorBildirimlerList sectorName={sectorName} />
      </div>
    </PublicPageLayout>
  )
}

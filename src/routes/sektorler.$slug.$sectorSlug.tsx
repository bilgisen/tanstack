import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { TrendingUp } from 'lucide-react'
import { SektorTabs } from '../components/sectors/SektorTabs'
import { getSectorNameFromSlug, groupSlugToDisplayName, slugToSectorName } from '../constants/sectorGroups'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'

export const Route = createFileRoute('/sektorler/$slug/$sectorSlug')({
  component: SektorDetailLayout,
})

function SektorDetailLayout() {
  const { slug, sectorSlug } = Route.useParams()
  const groupName = groupSlugToDisplayName(slug) || slug
  const sectorName = slugToSectorName(sectorSlug) || getSectorNameFromSlug(sectorSlug)
  const basePath = `/sektorler/${slug}/${sectorSlug}`
  const chatContext = `sector:${sectorName}`

  return (
    <PublicPageLayout context={chatContext} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}>
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
          <span className="text-muted-foreground/50">/</span>
          <Link to="/sektorler" className="transition-colors hover:text-foreground">Sektörler</Link>
          <span className="text-muted-foreground/50">/</span>
          <Link to="/sektorler/$slug" params={{ slug }} className="transition-colors hover:text-foreground">{groupName}</Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-medium text-foreground">{sectorName}</span>
        </nav>

        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary shrink-0" />
          <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none">{sectorName}</h1>
        </div>

        {/* Tabs */}
        <SektorTabs basePath={basePath} />

        {/* Child route content */}
        <Outlet />
      </div>
    </PublicPageLayout>
  )
}
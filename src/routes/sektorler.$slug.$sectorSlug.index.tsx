import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { SektorDetailContent } from '../components/sectors/SektorDetailContent'
import { getSectorNameFromSlug, groupSlugToDisplayName, slugToSectorName } from '../constants/sectorGroups'

export const Route = createFileRoute('/sektorler/$slug/$sectorSlug/')({
  component: SektorDetailPage,
})

function SektorDetailPage() {
  const { slug, sectorSlug } = Route.useParams()
  const groupName = groupSlugToDisplayName(slug) || slug
  const sectorName = slugToSectorName(sectorSlug) || getSectorNameFromSlug(sectorSlug)

  return (
    <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
        <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
        <Link to="/sektorler" className="transition-colors hover:text-foreground">Sektörler</Link>
        <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
        <Link to="/sektorler/$slug" params={{ slug }} className="transition-colors hover:text-foreground">{groupName}</Link>
      </div>

      <SektorDetailContent sectorName={sectorName} />
    </div>
  )
}

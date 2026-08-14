import { createFileRoute } from '@tanstack/react-router'
import { SektorBildirimlerList } from '../components/sectors/SektorBildirimlerList'
import { getSectorNameFromSlug, slugToSectorName } from '../constants/sectorGroups'

export const Route = createFileRoute('/sektorler/$slug/$sectorSlug/bildirimler')({
  component: SektorBildirimlerPage,
})

function SektorBildirimlerPage() {
  const { sectorSlug } = Route.useParams()
  const sectorName = slugToSectorName(sectorSlug) || getSectorNameFromSlug(sectorSlug)

  return <SektorBildirimlerList sectorName={sectorName} />
}

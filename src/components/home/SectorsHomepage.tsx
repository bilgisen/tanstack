import { useNavigate } from '@tanstack/react-router'
import { useSectorGroups } from '../../lib/useCompData'
import { getGroupColor, groupKeyToDisplayName, groupKeyToSlug } from '../../constants/sectorGroups'
import { SectorDonutChart } from '../sectors/SectorDonutChart'

export function SectorsHomepage() {
  const { data } = useSectorGroups()
  const navigate = useNavigate()

  const groups = [...(data?.groups || [])].sort((a, b) => (b.count || 0) - (a.count || 0))
  const totalCompanies = groups.reduce((sum, g) => sum + (g.count || 0), 0)

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
    <section className="px-4 md:px-6 py-4">
      <SectorDonutChart
        data={pieData}
        onItemClick={handleItemClick}
        legendColumns="grid-cols-2"
        showLegendValues={false}
        centerLabel={{ value: String(totalCompanies), label: 'Şirket' }}
      />
    </section>
  )
}
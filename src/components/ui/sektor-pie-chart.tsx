import { SectorDonutChart } from '../sectors/SectorDonutChart'

type SectorItem = {
  nameTr: string
  value: number
}

export function SektorPieChart({ data, onItemClick }: { data: Array<SectorItem>; onItemClick?: (item: { name: string; value: number }) => void }) {
  if (!data || data.length === 0) return null

  return (
    <SectorDonutChart
      data={data.map(d => ({ name: d.nameTr, value: d.value }))}
      onItemClick={onItemClick ? (item) => onItemClick({ name: item.name, value: item.value }) : undefined}
      innerRadius={50}
      outerRadius={100}
      height={260}
      legendColumns="grid-cols-1"
    />
  )
}
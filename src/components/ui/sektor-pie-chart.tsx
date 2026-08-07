import { SectorDonutChart } from '../sectors/SectorDonutChart'

type SectorItem = {
  nameTr: string
  value: number
}

export function SektorPieChart({ data }: { data: Array<SectorItem> }) {
  if (!data || data.length === 0) return null

  return (
    <SectorDonutChart
      data={data.map(d => ({ name: d.nameTr, value: d.value }))}
      innerRadius={50}
      outerRadius={100}
      height={260}
      legendColumns="grid-cols-1"
    />
  )
}
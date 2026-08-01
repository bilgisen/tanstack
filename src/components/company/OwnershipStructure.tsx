import { OwnershipPieChart } from './OwnershipPieChart'

interface Shareholder {
  name: string
  share_pct?: number | null
}

interface OwnershipStructureProps {
  shareholders?: Array<Shareholder> | null
  loading?: boolean
}

export function OwnershipStructure({ shareholders, loading }: OwnershipStructureProps) {
  if (loading) {
    return (
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">Ortaklık Yapısı</h3>
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!shareholders || shareholders.length === 0) return null

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-3">Ortaklık Yapısı</h3>
      <div className="space-y-4">
        <OwnershipPieChart shareholders={shareholders} />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-muted-foreground">Ticari Ünvan</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Pay Oranı(%)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {shareholders.map((s, i) => (
              <tr key={i}>
                <td className="py-2 pr-4">{s.name}</td>
                <td className="py-2 text-right font-medium tabular-nums">
                  {s.share_pct != null ? `${s.share_pct.toFixed(2)}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

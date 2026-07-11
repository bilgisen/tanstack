interface CompanyProfile {
  ticker: string
  unvan?: string
  kurulus?: string
  faaliyet?: string
  telefon?: string
  faks?: string
  adres?: string
}

interface CompanyProfileCardProps {
  profile?: CompanyProfile | null
  loading?: boolean
}

export function CompanyProfileCard({ profile, loading }: CompanyProfileCardProps) {
  if (loading) {
    return (
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">Şirket Künyesi</h3>
        <div className="space-y-2 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-5 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!profile) return null

  const rows: [string, string | undefined][] = [
    ['Ünvanı', profile.unvan],
    ['Kuruluş', profile.kurulus],
    ['Faal Alanı', profile.faaliyet],
    ['Telefon', profile.telefon],
    ['Faks', profile.faks],
    ['Adres', profile.adres],
  ]

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-3">Şirket Künyesi</h3>
      <dl className="divide-y">
        {rows.map(([label, value]) => (
          value ? (
            <div key={label} className="flex justify-between py-2 text-sm">
              <dt className="text-muted-foreground shrink-0 pr-4">{label}</dt>
              <dd className="font-medium text-right">{value}</dd>
            </div>
          ) : null
        ))}
      </dl>
    </div>
  )
}

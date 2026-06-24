import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, ChevronRight, Factory } from 'lucide-react'

export const Route = createFileRoute('/sektorler')({
  component: SektorlerPage,
})

type Sector = {
  slug: string;
  name: string;
  companyCount: number;
};

const SECTOR_SLUGS: Record<string, string> = {
  'Bankacılık': 'bankacilik',
  'Holding': 'holding',
  'Teknoloji': 'teknoloji',
  'Enerji': 'enerji',
  'Turizm': 'turizm',
  'Otomotiv': 'otomotiv',
  'Kimya': 'kimya',
  'Gıda, İçecek ve Tarım': 'gida-icecek-tarim',
  'İnşaat': 'insaat',
  'Metal': 'metal',
  'Taşıt': 'tasit',
  'Tekstil': 'tekstil',
  'Sağlık': 'saglik',
  'İletişim': 'iletisim',
  'Ulaştırma': 'ulasim',
  'Madencilik': 'madencilik',
  'Ticaret': 'ticaret',
  'Elektrik': 'elektrik',
  'Konaklama': 'konaklama',
  'Gayrimenkul': 'gayrimenkul',
  'Bilişim': 'bilisim',
  'Sigorta': 'sigorta',
  'Diğer': 'diger',
};

function toSlug(name: string): string {
  if (SECTOR_SLUGS[name]) return SECTOR_SLUGS[name]
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function SektorlerPage() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    async function fetchSectors() {
      const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev"
      try {
        const res = await fetch(`${compUrl}/api/v1/sectors`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.sectors) {
            const sectorList = data.sectors
              .filter((s: any) => s.name && s.name !== 'Diğer')
              .map((s: any) => ({
                slug: toSlug(s.name),
                name: s.name,
                companyCount: s.company_count || 0,
              }))
            if (isMounted) {
              setSectors(sectorList)
            }
          }
        }
      } catch (e) {
        console.error('Sektörler: Failed fetching sectors:', e)
      }
      if (isMounted) setLoading(false)
    }

    fetchSectors()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sektörler</h1>
        <p className="text-muted-foreground text-sm mt-1">Borsa İstanbul sektör bazlı analiz</p>
      </div>

      {/* Sector Grid - 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectors.map((sector) => (
          <Link
            key={sector.slug}
            to="/sektorler/$slug"
            params={{ slug: sector.slug }}
            className="group bg-card border border-border/50 rounded-2xl p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Factory size={16} className="text-primary shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sector.slug}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">{sector.name}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-foreground transition-colors" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{sector.companyCount} şirket</span>
                <span className="text-muted-foreground/50">Detaylar →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sectors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Sektör verisi yüklenemedi.
        </div>
      )}
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, ChevronRight, Factory, HelpCircle } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useChatStore } from '../store/chat'

export const Route = createFileRoute('/sektorler')({
  component: SektorlerPage,
})

type Sector = {
  slug: string;
  name: string;
  companyCount: number;
};

function toSlug(name: string): string {
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
  const { sendMessage } = useChatStore()

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
              .filter((s: any) => s.name)
              .map((s: any) => ({
                slug: toSlug(s.name),
                name: s.name,
                companyCount: s.total_companies || s.active_companies || 0,
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

  const sectorQuestions = [
    'Borsa İstanbul\'da en çok yükselen sektörler hangileri?',
    'Sektörel bazda hangi gruplar daha güçlü?',
    'Sektörler arasında para akışı analizi yapabilir misin?',
    'Hangi sektörler şu anda düşüş trendinde?',
    'Sektörel bazda temel analiz karşılaştırması yapar mısın?'
  ]

  return (
    <PublicPageLayout context="sektorler" placeholder="Sektörler hakkında bir soru sorun...">

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-400">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sektörler</h1>
              <p className="text-muted-foreground text-sm mt-1">Borsa İstanbul sektör bazlı analiz</p>
            </div>
          </div>

          {/* Sector Grid */}
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

          {/* Suggested Questions */}
          <div className="border border-border/45 bg-card/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
              <HelpCircle size={12} />
              <span>Önerilen Sektör Analiz Soruları</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sectorQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={async () => {
                    if (window.innerWidth < 1024) {
                      window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                    }
                    await sendMessage(q, 'sektorler');
                  }}
                  className="text-left text-xs text-muted-foreground hover:bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {sectors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Sektör verisi yüklenemedi.
            </div>
          )}
        </div>
      )}

    </PublicPageLayout>
  )
}

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { useCompSectorDetail } from '../lib/useCompData'
import { groupSlugToDisplayName, slugToSectorName } from '../constants/sectorGroups'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { BenchmarkSection } from '../components/sectors/BenchmarkSection'
import { LeaderboardSection } from '../components/sectors/LeaderboardSection'
import type { LeaderboardRow } from '../components/sectors/LeaderboardSection'

export const Route = createFileRoute('/sektorler/$slug/$sectorSlug')({
  component: SektorDetailPage,
})

export function getSectorNameFromSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/\s+/g, ' ')
}

function SektorDetailPage() {
  const { slug, sectorSlug } = Route.useParams()
  const navigate = useNavigate()
  const groupName = groupSlugToDisplayName(slug) || slug
  const sectorName = slugToSectorName(sectorSlug) || getSectorNameFromSlug(sectorSlug)

  const { data: sectorData, isLoading: loading } = useCompSectorDetail(sectorName)

  const benchmarks = sectorData?.benchmarks || {}
  const leaderboard = sectorData?.leaderboard || []

  const chatContext = `sector:${sectorName}`

  const hasBenchmarks = Object.keys(benchmarks).length > 0
  const hasLeaderboard = leaderboard.length > 0

  const leaderboardRows: Array<LeaderboardRow> = useMemo(
    () => leaderboard.map(r => ({
      ticker: r.ticker,
      name: r.name,
      composite_score: r.composite_score,
      pillar_finansal_saglik: r.pillar_finansal_saglik,
      pillar_karlilik_buyume: r.pillar_karlilik_buyume,
      pillar_degerleme: r.pillar_degerleme,
    })),
    [leaderboard]
  )

  if (loading) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}>
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor, lütfen bekleyin...</span>
        </div>
      </PublicPageLayout>
    )
  }

  return (
    <PublicPageLayout context={chatContext} placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}>
      <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Ana Sayfa</Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
          <Link to="/sektorler" className="transition-colors hover:text-foreground">Sektörler</Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
          <Link to="/sektorler/$slug" params={{ slug }} className="transition-colors hover:text-foreground">{groupName}</Link>
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{sectorName}</span>
        </nav>

        <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none">{sectorName}</h1>

        {hasBenchmarks && (
          <BenchmarkSection benchmarks={benchmarks} variant="sektor" />
        )}

        {hasLeaderboard && (
          <LeaderboardSection
            leaderboard={leaderboardRows}
            onCompanyClick={(ticker) => navigate({ to: `/hisse/${ticker.toLowerCase()}` })}
          />
        )}

        {!hasBenchmarks && !hasLeaderboard && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Bu sektör için skorlu şirket bulunamadı.
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}
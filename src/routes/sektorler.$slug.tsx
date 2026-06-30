import { createFileRoute, Link, Outlet, useNavigate, useMatches } from '@tanstack/react-router'
import { ArrowLeft, Factory, Loader2, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import companyLogos from '../constants/companyLogos.json'
import companyNames from '../constants/companyNames.json'
import { SLUG_TO_NAME } from '../constants/companyShared'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'

export const Route = createFileRoute('/sektorler/$slug')({
  component: SektorSlugLayout,
})

function SektorSlugLayout() {
  const matches = useMatches()
  const hasCompanyDetail = matches.some(m => m.routeId === '/sektorler/$slug/$company')

  if (hasCompanyDetail) {
    return <Outlet />
  }
  return <SektorDetailPage />
}

type ScoredCompany = {
  rank: number;
  ticker: string;
  name: string;
  score: number | null;
  reliability: string;
};

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground'
  if (score >= 70) return 'text-emerald-500'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function getScoreBg(score: number | null) {
  if (score === null) return 'bg-muted/20'
  if (score >= 70) return 'bg-emerald-500/10'
  if (score >= 50) return 'bg-amber-500/10'
  return 'bg-red-500/10'
}

function SektorDetailPage() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<ScoredCompany[]>([])
  const [sectorName, setSectorName] = useState('')
  const [hasScoreData, setHasScoreData] = useState(true)
  const [loading, setLoading] = useState(true)

  const chatContext = `sektor:${slug}`

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const name = SLUG_TO_NAME[slug] || slug
    setSectorName(name)

    async function fetchData() {
      const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev"

      try {
        // 1. Try leaderboard scores first
        const scoreRes = await fetch(`${compUrl}/api/v1/scores/leaderboard/sektor?top_n=50`)
        if (scoreRes.ok) {
          const data = await scoreRes.json()
          const sectors = Array.isArray(data) ? data : []

          const matchSector = sectors.find((s: any) => {
            const sectorSlug = s.sector?.toLowerCase()
              .replace(/i̇/g, 'i')
              .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
              .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
            return sectorSlug === slug
          })

          if (matchSector && matchSector.companies?.length > 0) {
            const scored: ScoredCompany[] = matchSector.companies.map((c: any) => ({
              rank: c.rank,
              ticker: c.ticker?.toUpperCase(),
              name: c.name || c.ticker,
              score: c.score ?? null,
              reliability: c.reliability || 'LOW',
            }))
            if (isMounted) {
              setCompanies(scored)
              setHasScoreData(true)
              setLoading(false)
            }
            return
          }
        }

        // 2. Fallback: fetch companies from sector API (no scores)
        setHasScoreData(false)
        const compRes = await fetch(`${compUrl}/api/v1/sectors/${encodeURIComponent(name)}/companies`)
        if (compRes.ok) {
          const compData = await compRes.json()
          if (compData?.companies) {
            const list: ScoredCompany[] = compData.companies
              .filter((c: any) => c.ticker)
              .map((c: any, i: number) => ({
                rank: i + 1,
                ticker: c.ticker.toUpperCase(),
                name: (companyNames as Record<string, string>)[c.ticker.toUpperCase()] || c.name || c.ticker,
                score: null,
                reliability: 'LOW',
              }))
            if (isMounted) setCompanies(list)
          }
        }
      } catch (e) {
        console.error('Sector data fetch failed:', e)
      }

      if (isMounted) setLoading(false)
    }

    fetchData()
    return () => { isMounted = false }
  }, [slug])

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
    <PublicPageLayout
      context={chatContext}
      placeholder={`${sectorName} sektörü hakkında bir soru sorun...`}
    >
      <div className="space-y-6 animate-in fade-in duration-400 flex flex-col min-h-fit pb-32">

        {/* Back */}
        <Link to="/sektorler" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          Sektörlere Dön
        </Link>

        {/* Sector Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border border-border/45 bg-card/25 rounded-2xl p-5 gap-4 relative overflow-hidden shrink-0 transition-all hover:border-border/60">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
              <Factory size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sektörler</span>
              <h1 className="text-base md:text-2xl font-bold text-foreground tracking-tight leading-none mt-1">{sectorName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{companies.length}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase">Şirket</div>
            </div>
          </div>
        </div>

        {/* Companies */}
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
            <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Trophy size={12} />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {hasScoreData ? 'Temel Analiz Puanı' : 'Sektör Şirketleri'}
            </h3>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {hasScoreData ? 'Puana göre sıralanmış' : 'Alfabetik'}
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {companies.map((company) => {
              const logoFile = companyLogos[company.ticker as keyof typeof companyLogos]
              return (
                <div
                  key={company.ticker}
                  onClick={() => navigate({ to: `/sektorler/${slug}/${company.ticker.toLowerCase()}` })}
                  className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">{company.rank}</span>
                    {logoFile ? (
                      <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                        <img src={`/logos/${logoFile}`} alt={company.ticker} className="h-full w-full object-cover p-0.5" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0 border border-primary/10">
                        {company.ticker.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {company.ticker}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{company.name}</div>
                    </div>
                  </div>
                  {hasScoreData && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-lg font-black font-mono ${getScoreColor(company.score)} ${getScoreBg(company.score)} px-2.5 py-0.5 rounded-lg`}>
                        {company.score !== null ? company.score.toFixed(1) : '-'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}

            {companies.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Bu sektör için veri bulunamadı.
              </div>
            )}
          </div>
        </div>

      </div>
    </PublicPageLayout>
  )
}

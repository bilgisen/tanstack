import { Link } from '@tanstack/react-router'
import { useCompSectorDetail, useSectorGroups } from '../../lib/useCompData'
import { groupKeyToDisplayName, groupKeyToSlug } from '../../constants/sectorGroups'

type SectorGroup = { key: string; name: string; count: number }
type SubSector = { sector_main: string; cnt: number }

function ScoreDonut({ score }: { score: number | null }) {
  const size = 58
  const stroke = 5.5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = score ?? 0
  const color = v >= 70 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#e23b4a'
  const dash = Math.max((v / 100) * c, 0)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[15px] font-bold text-foreground tabular-nums">
          {score != null ? Math.round(score) : '–'}
        </span>
      </div>
    </div>
  )
}

function SectorGroupCard({ group, subSectors }: { group: SectorGroup; subSectors: Array<SubSector> }) {
  const { data: detail } = useCompSectorDetail(group.key)
  const score = detail?.sector_score?.equal_weight ?? null
  const slug = groupKeyToSlug(group.key)
  const name = groupKeyToDisplayName(group.key) || group.name

  return (
    <Link
      to="/sektorler/$slug"
      params={{ slug }}
      className="group flex items-start justify-between gap-3 rounded-2xl border border-border/10 bg-card/60 p-4 transition-colors hover:border-border/25 hover:bg-card"
    >
      <div className="min-w-0 flex-1">
        <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {name}
        </span>
        <div className="mt-1 text-xs text-muted-foreground tabular-nums">
          {group.count || 0} şirket
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {subSectors.slice(0, 3).map((s) => (
            <span
              key={s.sector_main}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
            >
              <span className="truncate">{s.sector_main}</span>
              <span className="shrink-0 text-muted-foreground/70 tabular-nums">{s.cnt}</span>
            </span>
          ))}
          {subSectors.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              +{subSectors.length - 3}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <ScoreDonut score={score} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ort. Skor</span>
      </div>
    </Link>
  )
}

export function SectorGroupsBlock() {
  const { data: sectorGroupsData } = useSectorGroups()
  const sectors = sectorGroupsData?.sectors || []

  if (!sectorGroupsData) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/10 bg-card/60 p-4 animate-pulse">
            <div className="h-4 w-28 rounded bg-muted mb-2" />
            <div className="h-3 w-16 rounded bg-muted mb-4" />
            <div className="flex gap-1.5">
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-5 w-12 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const groups = [...(sectorGroupsData.groups || [])].sort((a, b) => (b.count || 0) - (a.count || 0))

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2">
      {groups.map((group) => {
        const subSectors = sectors
          .filter((s) => s.consolidated === group.key)
          .sort((a, b) => (b.cnt || 0) - (a.cnt || 0))
          .map((s) => ({ sector_main: s.sector_main, cnt: s.cnt || 0 }))
        return <SectorGroupCard key={group.key} group={group} subSectors={subSectors} />
      })}
    </div>
  )
}

import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { DataTable } from '../ui/data-table'
import { scoreTone } from '../../lib/scoreColors'
import type { Column } from '../ui/data-table'

export interface LeaderboardRow {
  ticker: string
  name: string
  composite_score: number | null
  pillar_finansal_saglik: number | null
  pillar_karlilik_buyume: number | null
  pillar_degerleme: number | null
  reliability?: string | null
}

interface LeaderboardSectionProps {
  leaderboard: Array<LeaderboardRow>
  onCompanyClick?: (ticker: string) => void
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function ScoreCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground/40">—</span>
  return <span className={`font-mono ${scoreTone(value).text}`}>{fmt(value, 0)}</span>
}

export function LeaderboardSection({ leaderboard, onCompanyClick }: LeaderboardSectionProps) {
  const withRank = useMemo(
    () => leaderboard.map((r, i) => ({ ...r, _rank: i + 1 })),
    [leaderboard]
  )
  if (withRank.length === 0) return null

  const columns: Array<Column<Record<string, unknown>>> = useMemo(() => [
    {
      key: '_rank', header: '#', sortable: false,
      render: (r: Record<string, unknown>) => <span className="text-[10px]">{String(r._rank)}</span>,
      className: 'w-8 text-muted-foreground font-mono',
    },
    {
      key: 'ticker', header: 'Hisse', sortable: true,
      render: (r: Record<string, unknown>) => <span className="font-mono font-bold text-foreground">{r.ticker as string}</span>,
    },
    {
      key: 'name', header: 'Şirket', sortable: true,
      render: (r: Record<string, unknown>) => <span className="text-muted-foreground text-[11px] truncate max-w-[140px] inline-block">{r.name as string}</span>,
    },
    {
      key: 'composite_score', header: 'Skor', sortable: true,
      render: (r: Record<string, unknown>) => <ScoreCell value={(r.composite_score ?? null) as number | null} />,
      className: 'text-right',
    },
    {
      key: 'pillar_finansal_saglik', header: 'Fin. Sağlık', sortable: true,
      render: (r: Record<string, unknown>) => <ScoreCell value={(r.pillar_finansal_saglik ?? null) as number | null} />,
      className: 'text-right',
    },
    {
      key: 'pillar_karlilik_buyume', header: 'Karlılık', sortable: true,
      render: (r: Record<string, unknown>) => <ScoreCell value={(r.pillar_karlilik_buyume ?? null) as number | null} />,
      className: 'text-right',
    },
    {
      key: 'pillar_degerleme', header: 'Değerleme', sortable: true,
      render: (r: Record<string, unknown>) => <ScoreCell value={(r.pillar_degerleme ?? null) as number | null} />,
      className: 'text-right',
    },
  ], [])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/20">
        <TrendingUp size={14} className="text-primary" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Sıralama</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">{withRank.length} şirket</span>
      </div>
      <DataTable
        columns={columns}
        data={withRank}
        onRowClick={onCompanyClick ? (row) => onCompanyClick(String(row.ticker)) : undefined}
        className="text-base"
      />
    </div>
  )
}
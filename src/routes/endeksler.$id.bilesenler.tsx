import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, ChevronDown, Loader2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { getIndexName } from '../constants/bistIndices'
import { useIndexComponents } from '../lib/useMarketData'
import { DataTable } from '../components/ui/data-table'
import type { Column } from '../components/ui/data-table'
import type { IndexComponentItem } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id/bilesenler')({
  component: EndeksBilesenlerPage,
})

const PAGE_SIZE = 50

function EndeksBilesenlerPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()
  const navigate = useNavigate()

  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const { data, isLoading, isFetching } = useIndexComponents(code, loadedCount, 0)

  const total = data?.total ?? 0
  const items = data?.data ?? []
  const hasMore = items.length < total

  const loadMore = useCallback(() => {
    setLoadedCount(prev => prev + PAGE_SIZE)
  }, [])

  const indexName = useMemo(() => getIndexName(code), [code])

  const columns: Array<Column<IndexComponentItem>> = useMemo(() => [
    {
      key: 'code',
      header: 'Ticker',
      sortable: true,
      className: 'w-[100px]',
      render: (item) => (
        <span className="font-bold font-mono text-foreground">{item.code}</span>
      ),
    },
    {
      key: 'last_price',
      header: 'Son Fiyat',
      sortable: true,
      sortKey: 'last_price',
      className: 'text-right w-[130px]',
      render: (item) =>
        item.last_price != null ? (
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {item.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'diff_percent',
      header: 'Gün %',
      sortable: true,
      sortKey: 'diff_percent',
      className: 'text-right w-[110px]',
      render: (item) => (
        <ChangeBadge value={item.diff_percent} />
      ),
    },
    {
      key: 'change_month_pct',
      header: 'Ay %',
      sortable: true,
      sortKey: 'change_month_pct',
      className: 'text-right w-[110px]',
      render: (item) => (
        <ChangeBadge value={item.change_month_pct} />
      ),
    },
    {
      key: 'change_ytd_pct',
      header: 'Yıl %',
      sortable: true,
      sortKey: 'change_ytd_pct',
      className: 'text-right w-[110px]',
      render: (item) => (
        <ChangeBadge value={item.change_ytd_pct} />
      ),
    },
    {
      key: 'volume',
      header: 'Hacim',
      sortable: true,
      sortKey: 'volume',
      className: 'text-right w-[130px]',
      render: (item) =>
        (item.volume ?? 0) > 0 ? (
          <span className="font-mono text-muted-foreground tabular-nums">
            {formatVolume(item.volume)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ], [])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-400 max-w-5xl mx-auto py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ChevronDown size={14} />
          </div>
          <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
            {indexName} Bileşenleri
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {items.length} / {total} hisse
        </span>
      </div>

      <div className="rounded-2xl border border-border/20">
        <DataTable
          columns={columns}
          data={items}
          onRowClick={(item) => navigate({ to: `/hisse/${item.code.toLowerCase()}` })}
        />
      </div>

      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMore}
            disabled={isFetching}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {isFetching ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Yükleniyor...
              </span>
            ) : (
              `Daha Fazla Göster (${Math.min(loadedCount + PAGE_SIZE, total) - items.length > 0 ? items.length : loadedCount} / ${total})`
            )}
          </button>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-sm text-muted-foreground/60 py-2">
          Tüm bileşenler gösteriliyor ({total} hisse)
        </p>
      )}
    </div>
  )
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">-</span>
  const isUp = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
      {isUp ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
      {isUp ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

function formatVolume(v: number | null): string {
  if (!v) return '-'
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return v.toLocaleString('tr-TR')
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { getIndexName, getIndexSlug } from '../constants/bistIndices'
import { useIndices } from '../lib/useMarketData'
import { DataTable } from '../components/ui/data-table'

export const Route = createFileRoute('/endeksler/')({
  component: EndekslerPage,
})

function EndekslerPage() {
  const { data: indicesData, isLoading, isError } = useIndices()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive text-sm">Veri alınamadı. Lütfen sayfayı yenileyin.</p>
      </div>
    )
  }

  let indices: any[] = []
  try {
    indices = (indicesData || [])
      .map((item: any) => ({
        code: item.code?.toUpperCase() || '',
        name: getIndexName(item.code) || item.name || item.code,
        last_price: item.last_price ?? 0,
        diff_percent: item.diff_percent ?? 0,
      }))
      .filter((i: any) => i.code)
  } catch (e) {
    console.error('EndekslerPage: error processing indices data', e)
  }

  const columns = [
    {
      key: 'code',
      header: 'Ticker',
      sortable: true,
      className: 'w-[100px]',
      render: (item: any) => <span className="font-bold font-mono text-foreground">{item.code}</span>,
    },
    {
      key: 'name',
      header: 'Endeks',
      sortable: true,
      render: (item: any) => <span className="text-muted-foreground">{item.name}</span>,
    },
    {
      key: 'last_price',
      header: 'Son',
      sortable: true,
      sortKey: 'last_price',
      className: 'text-right w-[140px]',
      render: (item: any) =>
        item.last_price > 0 ? (
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {item.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'diff_percent',
      header: 'Fark %',
      sortable: true,
      sortKey: 'diff_percent',
      className: 'text-right w-[120px]',
      render: (item: any) => {
        const isUp = item.diff_percent >= 0
        return (
          <span className={`inline-flex items-center gap-1 font-bold ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
            {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {isUp ? '+' : ''}{item.diff_percent.toFixed(2)}%
          </span>
        )
      },
    },
    {
      key: 'volume',
      header: 'Hacim',
      sortable: true,
      sortKey: 'volume',
      className: 'text-right w-[140px]',
      render: (item: any) =>
        item.volume > 0 ? (
          <span className="font-mono text-muted-foreground tabular-nums">
            {(item.volume / 1_000_000_000).toFixed(2).replace('.', ',')}B
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ]

  return (
    <div className="space-y-5 animate-in fade-in duration-400 max-w-5xl mx-auto py-2">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <ArrowUp size={14} />
        </div>
        <h2 className="text-base font-bold text-foreground uppercase tracking-wider">Tüm Endeksler</h2>
      </div>

      <div className="rounded-2xl border border-border/20">
        <DataTable
          columns={columns}
          data={indices}
          onRowClick={(item) => navigate({ to: `/endeksler/${getIndexSlug(item.code)}` })}
        />
      </div>
    </div>
  )
}

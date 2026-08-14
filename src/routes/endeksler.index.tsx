import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react'
import { INDEX_CATEGORIES, getIndexName, getIndexSlug } from '../constants/bistIndices'
import { useIndices } from '../lib/useMarketData'
import {  DataTable } from '../components/ui/data-table'
import type { IndexCategory } from '../constants/bistIndices'
import type {Column} from '../components/ui/data-table';

type ProcessedIndex = {
  code: string
  name: string
  last_price: number
  diff_percent: number
  volume: number | undefined
  component_count: number | undefined
}

export const Route = createFileRoute('/endeksler/')({
  component: EndekslerPage,
})

function EndekslerPage() {
  const { data: indicesData, isLoading, isError } = useIndices()
  const navigate = useNavigate()
  const [cat, setCat] = useState<IndexCategory>('sektor')

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

  let indices: Array<ProcessedIndex> = []
  try {
    indices = (indicesData || [])
      .map(item => ({
        code: item.code?.toUpperCase() || '',
        name: getIndexName(item.code) || item.name || item.code,
        last_price: item.last_price ?? 0,
        diff_percent: item.diff_percent ?? 0,
        volume: (item as Record<string, unknown>).volume as number | undefined,
        component_count: (item as Record<string, unknown>).component_count as number | undefined,
      }))
      .filter(i => i.code)
  } catch (e) {
    console.error('EndekslerPage: error processing indices data', e)
  }

  const catCodes = INDEX_CATEGORIES[cat].codes
  const visible = indices
    .filter(i => catCodes.includes(i.code))
    .sort((a, b) => catCodes.indexOf(a.code) - catCodes.indexOf(b.code))

  const columns: Array<Column<ProcessedIndex>> = [
    {
      key: 'code',
      header: 'Ticker',
      sortable: true,
      className: 'w-[100px]',
      render: (item) => <span className="font-bold font-mono text-foreground">{item.code}</span>,
    },
    {
      key: 'name',
      header: 'Endeks',
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{item.name}</span>,
    },
    {
      key: 'last_price',
      header: 'Son',
      sortable: true,
      sortKey: 'last_price',
      className: 'text-right w-[140px]',
      render: (item) =>
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
      render: (item) => {
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
      key: 'component_count',
      header: 'Bileşen',
      sortable: true,
      sortKey: 'component_count',
      className: 'text-right w-[110px]',
      render: (item) =>
        (item.component_count ?? 0) > 0 ? (
          <span className="font-mono text-muted-foreground tabular-nums">{item.component_count}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'volume',
      header: 'Hacim',
      sortable: true,
      sortKey: 'volume',
      className: 'text-right w-[140px]',
      render: (item) =>
        (item.volume ?? 0) > 0 ? (
          <span className="font-mono text-muted-foreground tabular-nums">
            {((item.volume ?? 0) / 1_000_000_000).toFixed(2).replace('.', ',')}B
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

      <div className="flex gap-1 rounded-xl bg-muted/60 p-1 w-fit">
        {(Object.keys(INDEX_CATEGORIES) as Array<IndexCategory>).map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              cat === c ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {INDEX_CATEGORIES[c].label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/20">
        <DataTable
          columns={columns}
          data={visible}
          onRowClick={(item) => navigate({ to: `/endeksler/${getIndexSlug(item.code)}` })}
        />
      </div>
    </div>
  )
}

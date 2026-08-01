import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, FileText } from 'lucide-react'
import { useCompStatements } from '../lib/useCompData'
import {  DataTable } from '../components/ui/data-table'
import type {Column} from '../components/ui/data-table';

export const Route = createFileRoute('/hisse/$ticker/tablolar')({
  component: FinancialStatementsPage,
})

interface StatementItem {
  item_code: string
  item_desc_tr: string
  period_key: string
  value_try: number | null
  financial_group_label?: string
}

interface GroupSection {
  label: string
  items: Array<StatementItem>
}

interface GroupedData {
  [type: string]: GroupSection
}

interface PivotRow {
  item_desc_tr: string
  item_code: string
  [period: string]: number | string | null
}

function fmt(val: number | null | undefined): string {
  if (val == null) return '—'
  if (Math.abs(val) >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`
  if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatPeriod(pk: string): string {
  if (pk.length === 6) return `${pk.slice(0, 4)}/${pk.slice(4)}`
  return pk
}

function pivotStatements(items: Array<StatementItem>): { rows: Array<PivotRow>; periods: Array<string> } {
  const periodSet = new Set<string>()
  const rowMap = new Map<string, PivotRow>()

  for (const item of items) {
    periodSet.add(item.period_key)
    const key = item.item_code
    if (!rowMap.has(key)) {
      rowMap.set(key, { item_desc_tr: item.item_desc_tr || item.item_code, item_code: key })
    }
    const row = rowMap.get(key)!
    row[item.period_key] = item.value_try
  }

  const periods = [...periodSet].sort().reverse()
  const rows = [...rowMap.values()]

  return { rows, periods }
}

function FinancialStatementsPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const { data: raw, isLoading } = useCompStatements(tickerUpper)

  const rawRecord = raw as Record<string, unknown> | null
  const grouped = (rawRecord?.grouped || (rawRecord?.data as Record<string, unknown> | undefined)?.grouped) as GroupedData | null

  const sections: Array<[string, GroupSection]> = grouped
    ? Object.entries(grouped)
    : []

  const sectionOrder = ['balance_sheet', 'income_statement', 'cash_flow']

  const orderedSections = sectionOrder
    .map(key => sections.find(([k]) => k === key))
    .filter(Boolean) as Array<[string, GroupSection]>

  const remaining = sections.filter(([k]) => !sectionOrder.includes(k))
  const allSections = [...orderedSections, ...remaining]

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-muted/20 rounded-xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (allSections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={24} className="text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Mali tablo verisi bulunamadı.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {allSections.map(([type, section]) => {
        const { rows, periods } = pivotStatements(section.items)
        if (rows.length === 0 || periods.length === 0) return null

        const columns: Array<Column<PivotRow>> = [
          {
            key: 'item_desc_tr',
            header: 'Kalem',
            render: (row) => (
              <span className="text-sm font-medium text-foreground">{row.item_desc_tr}</span>
            ),
            className: 'sticky left-0 bg-background min-w-[200px] md:min-w-[280px]',
          },
          ...periods.map(p => ({
            key: p,
            header: formatPeriod(p),
            render: (row: PivotRow) => (
              <span className="font-mono text-sm tabular-nums">{fmt(row[p] as number | null)}</span>
            ),
            className: 'text-right min-w-[100px] md:min-w-[120px]',
          })),
        ]

        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{section.label}</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">{rows.length} kalem</span>
            </div>
            <div className="border border-border/40 rounded-2xl overflow-hidden">
              <DataTable
                columns={columns}
                data={rows}
                className="max-h-[600px] overflow-auto"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

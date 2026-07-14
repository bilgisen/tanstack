import { cn } from "@/lib/utils"
import { type ReactNode, useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
  sortable?: boolean
  sortKey?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  className?: string
  hideHeader?: boolean
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  className,
  hideHeader,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const tableColumns = useMemo(() => {
    const helper = createColumnHelper<T>()
    return columns.map((col) =>
      helper.accessor((row: T) => row[col.sortKey || col.key] as string | number, {
        id: col.key,
        enableSorting: col.sortable ?? false,
        header: () => col.header,
        cell: (info) => col.render(info.row.original) as ReactNode,
        meta: { className: col.className },
      })
    )
  }, [columns])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const headerGroup = table.getHeaderGroups()[0]

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        {!hideHeader && (
          <thead>
            <tr className="border-b border-border/40">
              {headerGroup.headers.map((header) => {
                const colDef = columns.find((c) => c.key === header.id)
                const isSortable = colDef?.sortable ?? false
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                    className={cn(
                      "h-10 px-3 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider",
                      colDef?.className,
                      isSortable && "cursor-pointer select-none hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {isSortable && (
                        <span className="text-muted-foreground/50">
                          {sorted === "asc" ? <ArrowUp size={12} /> : sorted === "desc" ? <ArrowDown size={12} /> : <ArrowUpDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
        )}
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                "border-b border-border/20 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/30"
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const colDef = columns.find((c) => c.key === cell.column.id)
                return (
                  <td
                    key={cell.id}
                    className={cn("p-3 align-middle", colDef?.className)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Veri bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

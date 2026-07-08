import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b border-border/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "h-10 px-3 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={item.id || idx}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(
                "border-b border-border/20 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/30"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("p-3 align-middle", col.className)}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
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

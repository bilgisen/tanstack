import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#f43f5e', '#0ea5e9', '#f97316', '#14b8a6', '#64748b',
]

type SectorItem = {
  nameTr: string
  value: number
}

export function SektorPieChart({ data }: { data: SectorItem[] }) {
  if (!data || data.length === 0) return null

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="w-full max-w-[260px] shrink-0">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="nameTr"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${((value / total) * 100).toFixed(1)}%`}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full space-y-1.5 text-sm">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-muted-foreground truncate">{item.nameTr}</span>
            </div>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

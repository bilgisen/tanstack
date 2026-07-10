import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { DataTable } from '../components/ui/data-table'
import bistIndices, { getIndexName, getIndexSlug } from '../constants/bistIndices'

export const Route = createFileRoute('/endeksler/')({
  component: EndekslerPage,
})

type IndexData = {
  code: string
  name: string
  last_price: number
  diff_percent: number
  up: boolean
}

const TOP_INDICES = ['XU100', 'XU030', 'XU500', 'XBANK', 'XUSIN']

function EndekslerPage() {
  const navigate = useNavigate()
  const [emblaRef] = useEmblaCarousel({ align: 'start', slidesToScroll: 1 })

  const [indices, setIndices] = useState<Record<string, IndexData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || 'https://hono.jetborsa.com'
      try {
        const res = await fetch(`${apiUrl}/api/market/indices`)
        if (res.ok) {
          const json = await res.json()
          if (json?.data && Array.isArray(json.data)) {
            const map: Record<string, IndexData> = {}
            json.data.forEach((idx: any) => {
              const code = idx.code?.toUpperCase()
              if (code) {
                map[code] = {
                  code,
                  name: getIndexName(code),
                  last_price: idx.last_price ?? null,
                  diff_percent: idx.diff_percent ?? null,
                  up: (idx.diff_percent ?? 0) >= 0,
                }
              }
            })
            if (mounted) setIndices(map)
          }
        }
      } catch (e) {
        console.error('Failed fetching indices:', e)
      }
      if (mounted) setLoading(false)
    }
    fetchData()
  }, [])

  const topIndices = TOP_INDICES
    .map(code => indices[code])
    .filter(Boolean)

  const allIndexCodes = Object.keys(bistIndices).filter(code => !TOP_INDICES.includes(code))
  const allIndices = allIndexCodes
    .map(code => ({
      code,
      name: getIndexName(code),
      last_price: indices[code]?.last_price ?? null,
      diff_percent: indices[code]?.diff_percent ?? null,
      up: (indices[code]?.diff_percent ?? 0) >= 0,
    }))

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400 max-w-5xl mx-auto py-2">
      {/* Index Cards Carousel */}
      <section>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {topIndices.map((idx) => (
              <Link
                key={idx.code}
                to="/endeksler/$id"
                params={{ id: getIndexSlug(idx.code) }}
                className="flex-none w-[200px] md:w-[240px] rounded-2xl p-4 bg-card/50 border border-border/40 hover:border-border/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-foreground truncate">{idx.name}</span>
                  <span className={`text-sm font-bold ${idx.up ? 'text-emerald-500' : 'text-destructive'}`}>
                    %{idx.up ? '+' : ''}{idx.diff_percent.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-foreground font-mono truncate">
                    {idx.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${idx.up ? 'bg-emerald-500' : 'bg-destructive'}`}>
                    {idx.up ? <ArrowUp size={16} className="text-white" /> : <ArrowDown size={16} className="text-white" />}
                  </div>
                </div>
              </Link>
            ))}
            {topIndices.length === 0 && (
              <div className="flex-none w-[200px] md:w-[240px] rounded-2xl p-4 bg-card/30 border border-border/20">
                <p className="text-xs text-muted-foreground">Veri yükleniyor...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tüm Endeksler */}
      <section>
        <DataTable
          hideHeader
          columns={[
            {
              key: 'code',
              header: '',
              className: 'w-24 font-mono',
              render: (item) => (
                <span className="font-mono text-sm font-semibold text-primary">{item.code}</span>
              ),
            },
            {
              key: 'name',
              header: '',
              render: (item) => (
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              ),
            },
            {
              key: 'last_price',
              header: '',
              className: 'w-40 text-right font-mono',
              render: (item) => (
                <span className="font-mono text-sm tabular-nums">
                  {item.last_price != null
                    ? item.last_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '-'}
                </span>
              ),
            },
            {
              key: 'diff_percent',
              header: '',
              className: 'w-28 text-right',
              render: (item) => (
                item.diff_percent != null ? (
                  <span className={`text-sm font-semibold ${item.up ? 'text-emerald-500' : 'text-destructive'}`}>
                    {item.up ? '+' : ''}{item.diff_percent.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )
              ),
            },
          ]}
          data={allIndices}
          onRowClick={(item) =>
            navigate({ to: '/endeksler/$id', params: { id: getIndexSlug(item.code) } })
          }
        />
      </section>
    </div>
  )
}

import { Suspense, lazy, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Loader2 } from 'lucide-react'

const TradingViewChart = lazy(() => import('../dashboard/TradingViewChart'))

interface LazyTradingViewChartProps {
  symbol: string
  lastPrice?: number
}

function ChartLoading() {
  return (
    <div className="flex min-h-[300px] md:aspect-video md:min-h-0 w-full flex-col items-center justify-center gap-3 bg-background/55 backdrop-blur-xs">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary shrink-0" size={20} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-foreground">Grafik Yükleniyor</span>
        <span className="text-xs text-muted-foreground">Veriler işleniyor...</span>
      </div>
    </div>
  )
}

export function LazyTradingViewChart(props: LazyTradingViewChartProps) {
  const queryClient = useQueryClient()
  const [loadRequested, setLoadRequested] = useState(false)

  const hasClientCache = queryClient.getQueryData(['history', props.symbol, 150]) !== undefined

  // Auto-load if data is already cached (from prefetch), otherwise show load button
  const shouldAutoLoad = hasClientCache || loadRequested

  if (shouldAutoLoad) {
    return (
      <Suspense fallback={<ChartLoading />}>
        <TradingViewChart {...props} />
      </Suspense>
    )
  }

  return (
    <button
      onClick={() => setLoadRequested(true)}
      className="group relative flex min-h-[300px] md:aspect-video md:min-h-0 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-muted/20 transition-all hover:border-primary/30 hover:bg-muted/30 cursor-pointer"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
        <Eye className="text-primary transition-transform group-hover:scale-110" size={22} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-foreground">Grafikleri Yükle</span>
        <span className="text-xs text-muted-foreground">Tarihsel candlestick verisi</span>
      </div>
    </button>
  )
}

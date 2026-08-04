import { Suspense, lazy, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ChartOverlay } from './ChartOverlay'

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
  const [loadRequested, setLoadRequested] = useState(false)

  if (!loadRequested) {
    return <ChartOverlay onClick={() => setLoadRequested(true)} />
  }

  return (
    <Suspense fallback={<ChartLoading />}>
      <TradingViewChart {...props} />
    </Suspense>
  )
}

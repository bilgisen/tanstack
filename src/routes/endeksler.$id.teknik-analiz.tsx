import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Activity, ArrowDown, ArrowUp, CandlestickChart, Gauge } from 'lucide-react'
import { LazyTradingViewChart } from '../components/charts/LazyTradingViewChart'
import { getIndexName } from '../constants/bistIndices'
import { useIndexDetail, useIndices } from '../lib/useMarketData'

export const Route = createFileRoute('/endeksler/$id/teknik-analiz')({
  component: EndeksTechnicalAnalysisPage,
})


function EndeksTechnicalAnalysisPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()

  const { data: indicesData } = useIndices()
  const { data: indexDetail } = useIndexDetail(code)

  const priceDetails = useMemo(() => {
    const liveIndex = indicesData?.find(item => item.code?.toUpperCase() === code)
    const price = liveIndex?.last_price ?? indexDetail?.last ?? 0
    const changePct = liveIndex?.diff_percent ?? indexDetail?.changePercent ?? 0
    return {
      name: getIndexName(code) || liveIndex?.name || code,
      code,
      price,
      diffPercent: changePct,
    }
  }, [indicesData, indexDetail, code])

  const isUp = priceDetails.diffPercent >= 0
  const trend = isUp ? 'Yükseliş' : 'Düşüş'
  const trendTag = Math.abs(priceDetails.diffPercent) >= 1 ? 'Güçlü' : 'Hafif'

  const metrics: Array<{ label: string; value: string; up?: boolean }> = [
    { label: 'Günlük Değişim', value: `${isUp ? '+' : ''}${priceDetails.diffPercent.toFixed(2)}%`, up: isUp },
    { label: 'Gün İçi', value: indexDetail?.high && indexDetail?.low ? `${indexDetail.low.toLocaleString('tr-TR')} - ${indexDetail.high.toLocaleString('tr-TR')}` : '—' },
    { label: 'Haftalık Dip', value: indexDetail?.weekLow != null ? (indexDetail.weekLow as number).toLocaleString('tr-TR') : '—' },
    { label: 'Haftalık Zirve', value: indexDetail?.weekHigh != null ? (indexDetail.weekHigh as number).toLocaleString('tr-TR') : '—' },
  ]

  return (
    <div className="space-y-5">
      <LazyTradingViewChart symbol={code} lastPrice={priceDetails.price} />

      {/* Son fiyat özeti */}
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 p-4">
        <div>
          <div className="text-sm text-muted-foreground">{priceDetails.name}</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {priceDetails.price > 0 ? priceDetails.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
          </div>
          <div className={`text-base font-semibold inline-flex items-center gap-1 ${isUp ? 'text-emerald-500' : 'text-destructive'}`}>
            {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {isUp ? '+' : ''}{priceDetails.diffPercent.toFixed(2)}%
          </div>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CandlestickChart size={28} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Activity size={14} className="text-primary" />
              Teknik Görünüm
            </span>
          </h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
            {trend} · {trendTag}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center gap-1.5 mb-1">
                <Gauge size={14} className="text-muted-foreground" />
                <span className="text-base font-medium text-muted-foreground">{m.label}</span>
              </div>
              <span className={`text-base font-medium ${m.up === undefined ? 'text-foreground' : m.up ? 'text-emerald-500' : 'text-destructive'}`}>{m.value}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Detaylı teknik göstergeler (RSI, MACD, destek/direnç) ve AI yorumu için şirket bazlı analiz sekmelerini kullanın.{" "}
          <span className="text-primary">Endeks görünümü canlı piyasa verisiyle takip edilmektedir.</span>
        </p>
      </div>
    </div>
  )
}



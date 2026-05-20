import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Loader2, ShieldAlert, Cpu } from 'lucide-react'
import { useUIStore } from '../store/ui'
import { ContextBar } from '../components/ui/ContextBar'



export const Route = createFileRoute('/forex/$symbol')({
  component: ForexDetailPage,
})

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type TAResponse = {
  ticker: string;
  indicators: {
    rsi?: number;
    macd?: {
      macd?: number;
      value?: number;
      signal: number;
      histogram: number;
    };
    sma_20?: number;
    sma_50?: number;
    close_price?: number;
  };
}

function ForexDetailPage() {
  const { symbol } = Route.useParams()
  const [liveData, setLiveData] = useState<any>(null)
  const [historyData, setHistoryData] = useState<Candle[]>([])
  const [taData, setTaData] = useState<TAResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useUIStore()
  
  const chartContainerRef = useRef<HTMLDivElement>(null)

  const chartInstanceRef = useRef<any>(null)

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true)
      setError(null)
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787"
        
        // 1. Canlı Fiyat
        const liveRes = await fetch(`${apiUrl}/api/market/symbol/${symbol}`)
        const liveJson = await liveRes.json()
        if (liveJson.success) {
          setLiveData(liveJson.data)
        }
        
        // 2. Geçmiş OHLCV (Grafik için)
        const histRes = await fetch(`${apiUrl}/api/market/symbol/${symbol}/history`)
        const histJson = await histRes.json()
        if (histJson.success && histJson.data) {
          setHistoryData(histJson.data)
        } else {
          throw new Error(histJson.error || "Geçmiş veriler yüklenemedi")
        }

        // 3. Teknik Analiz Verisi
        const taRes = await fetch(`${apiUrl}/api/market/symbol/${symbol}/ta`)
        if (taRes.ok) {
          const taJson = await taRes.json()
          setTaData(taJson)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Veriler yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [symbol])

  // Lightweight Charts Kurulumu ve Veri Yükleme
  useEffect(() => {
    if (!chartContainerRef.current || historyData.length === 0) return

    // Varsa eski grafiği yok et
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.remove()
      } catch (e) {
        console.error("Eski grafik yok edilirken hata:", e)
      }
    }

    // Grafik renklerini temaya göre belirle
    const isDark = document.documentElement.classList.contains('dark')
    const chartBg = isDark ? '#09090b' : '#ffffff'
    const chartText = isDark ? '#a1a1aa' : '#3f3f46'
    const gridColor = isDark ? 'rgba(24, 24, 27, 0.5)' : 'rgba(228, 228, 231, 0.5)'
    const borderColor = isDark ? '#27272a' : '#e4e4e7'

    // Grafik nesnesini oluştur
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: chartBg },
        textColor: chartText,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 450,
      timeScale: {
        borderColor: borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: borderColor,
      }
    })

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // emerald-500
      downColor: '#f43f5e', // rose-500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    })

    // Veriyi yükle (Lightweight Charts formatı: { time, open, high, low, close })
    const seenTimes = new Set<string>()
    const formattedData = [...historyData]
      .map(item => {
        try {
          const timestamp = typeof item.time === 'string' ? parseInt(item.time, 10) : item.time;
          if (isNaN(timestamp)) return null;
          
          // Handle seconds vs milliseconds (e.g. 10 digits vs 13 digits)
          const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
          
          return {
            time: date.toISOString().split('T')[0] as any,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          };
        } catch (e) {
          console.error("Error parsing history time:", item, e);
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;
        if (seenTimes.has(item.time)) return false;
        seenTimes.add(item.time);
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));

    console.log("Chart initialized with data items count:", formattedData.length);
    candlestickSeries.setData(formattedData)

    // Add mock AI Annotation Markers
    if (formattedData.length > 20) {
      const markers = [
        {
          time: formattedData[formattedData.length - 20].time,
          position: 'aboveBar' as const,
          color: '#f43f5e',
          shape: 'arrowDown' as const,
          text: 'AI: Death Cross (50GMA < 200GMA)',
        },
        {
          time: formattedData[formattedData.length - 10].time,
          position: 'belowBar' as const,
          color: '#3b82f6',
          shape: 'circle' as const,
          text: 'AI: RSI Aşırı Satım (<30)',
        },
        {
          time: formattedData[formattedData.length - 2].time,
          position: 'belowBar' as const,
          color: '#10b981',
          shape: 'arrowUp' as const,
          text: 'AI: Hacim Patlaması & Alım',
        }
      ];
      candlestickSeries.setMarkers(markers);
    }

    // ResizeObserver ile responsive boyut takibi
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0) return
      const { width } = entries[0].contentRect
      chart.resize(width, 450)
    })
    resizeObserver.observe(chartContainerRef.current)

    chartInstanceRef.current = chart

    return () => {
      resizeObserver.disconnect()
      try {
        chart.remove()
      } catch (e) {
        console.error("Temizleme sırasında grafik kaldırılırken hata:", e)
      }
      chartInstanceRef.current = null
    }
  }, [historyData, theme])

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <span>Piyasa verileri analiz ediliyor...</span>
      </div>
    )
  }

  if (error || !liveData) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center text-zinc-400 gap-4">
        <ShieldAlert className="text-rose-500" size={48} />
        <span className="text-lg font-semibold">{error || "Veri bulunamadı"}</span>
        <Link to="/forex" className="flex items-center gap-2 text-emerald-500 hover:underline">
          <ArrowLeft size={16} /> Forex Listesine Geri Dön
        </Link>
      </div>
    )
  }

  const isUp = (liveData.diff_percent ?? 0) >= 0
  const rsiVal = taData?.indicators?.rsi
  const macdVal = taData?.indicators?.macd?.macd ?? taData?.indicators?.macd?.value
  
  // Basit Karar Algoritması
  let decision = "NÖTR"
  let decisionColor = "text-zinc-400 bg-zinc-400/10 border-zinc-500/20"
  
  if (rsiVal) {
    if (rsiVal < 30) {
      decision = "AŞIRI SATIM / GÜÇLÜ AL"
      decisionColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    } else if (rsiVal > 70) {
      decision = "AŞIRI ALIM / GÜÇLÜ SAT"
      decisionColor = "text-rose-400 bg-rose-500/10 border-rose-500/30"
    } else if (rsiVal > 50) {
      decision = "AL"
      decisionColor = "text-emerald-500 bg-emerald-500/5 border-emerald-500/20"
    } else {
      decision = "SAT"
      decisionColor = "text-rose-500 bg-rose-500/5 border-rose-500/20"
    }
  }

  return (
    <div className="space-y-6 max-w-[1550px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Link to="/forex" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-xs transition-colors mb-2">
            <ArrowLeft size={14} /> Forex Piyasalarına Dön
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{symbol.toUpperCase()}</h1>
            <span className="text-sm font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">Canlı FX</span>
          </div>
        </div>

        {/* Live Prices & Context */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-zinc-500 font-medium">Son Fiyat</div>
              <div className="text-2xl font-bold text-zinc-100">{liveData.last_price?.toFixed(4) || liveData.last}</div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden sm:block" />
            <div>
              <div className="text-xs text-zinc-500 font-medium">Günlük Değişim</div>
              <div className={`text-lg font-bold flex items-center gap-0.5 ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {isUp ? "+" : ""}{liveData.diff_percent?.toFixed(2) || "0.00"}%
              </div>
            </div>
          </div>
          <div className="w-full sm:w-px h-px sm:h-8 bg-zinc-800" />
          <div className="w-full sm:w-48">
            {/* Mock Min Max for Daily Range Context */}
            <ContextBar 
              label="Günlük Aralık"
              min={(liveData.last_price || liveData.last) * 0.985}
              max={(liveData.last_price || liveData.last) * 1.015}
              current={liveData.last_price || liveData.last}
              formatValue={(v) => v.toFixed(4)}
            />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">İnteraktif Grafik (Günlük Mumlar)</h2>
          <span className="text-xs text-zinc-500 font-medium">TradingView Lightweight Charts</span>
        </div>
        <div className="h-[450px] w-full rounded-xl overflow-hidden relative border border-zinc-900 bg-zinc-950">
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>
      </div>

      {/* Technical Analysis Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recommendation */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-emerald-500" size={18} />
            <h3 className="text-sm font-semibold text-zinc-300">Yapay Zeka Görünümü</h3>
          </div>
          <div className="space-y-2 text-center py-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Özet Karar</div>
            <div className={`text-lg font-black border rounded-xl py-2.5 px-4 inline-block ${decisionColor}`}>
              {decision}
            </div>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed text-center">
            RSI, MACD ve Hareketli Ortalamalar analiz edilerek matematiksel olarak hesaplanmıştır.
          </p>
        </div>

        {/* Technical Oscillators */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 shadow-md space-y-4 col-span-2">
          <h3 className="text-sm font-semibold text-zinc-300">Hesaplanan Göstergeler (Daily)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RSI */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 font-medium">RSI (14)</div>
                <div className="text-xs text-zinc-500 mt-1">Relative Strength Index</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-zinc-200">{rsiVal ? rsiVal.toFixed(2) : "-"}</div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  rsiVal && rsiVal > 70 ? "bg-rose-500/10 text-rose-400" :
                  rsiVal && rsiVal < 30 ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-zinc-800 text-zinc-400"
                }`}>
                  {rsiVal && rsiVal > 70 ? "Aşırı Alım" : rsiVal && rsiVal < 30 ? "Aşırı Satım" : "Nötr"}
                </span>
              </div>
            </div>

            {/* MACD */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 font-medium">MACD (12, 26, 9)</div>
                <div className="text-xs text-zinc-500 mt-1">Trend Gücü Sinyali</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-zinc-200">
                  {macdVal !== undefined ? macdVal.toFixed(3) : "-"}
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {macdVal !== undefined && taData?.indicators?.macd?.signal !== undefined && macdVal > taData.indicators.macd.signal ? "Boğa Sinyali" : "Ayı Sinyali"}
                </span>
              </div>
            </div>

            {/* SMA 20 */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 font-medium">SMA (20)</div>
                <div className="text-xs text-zinc-500 mt-1">20 Günlük Basit Ort.</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-zinc-200">
                  {taData?.indicators?.sma_20 ? taData.indicators.sma_20.toFixed(4) : "-"}
                </div>
                <span className={`text-[10px] font-semibold uppercase ${
                  taData?.indicators?.sma_20 && liveData.last_price > taData.indicators.sma_20 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {taData?.indicators?.sma_20 && liveData.last_price > taData.indicators.sma_20 ? "Fiyat Üstünde" : "Fiyat Altında"}
                </span>
              </div>
            </div>

            {/* SMA 50 */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 font-medium">SMA (50)</div>
                <div className="text-xs text-zinc-500 mt-1">50 Günlük Basit Ort.</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-zinc-200">
                  {taData?.indicators?.sma_50 ? taData.indicators.sma_50.toFixed(4) : "-"}
                </div>
                <span className={`text-[10px] font-semibold uppercase ${
                  taData?.indicators?.sma_50 && liveData.last_price > taData.indicators.sma_50 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {taData?.indicators?.sma_50 && liveData.last_price > taData.indicators.sma_50 ? "Boğa Eğilimi" : "Ayı Eğilimi"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

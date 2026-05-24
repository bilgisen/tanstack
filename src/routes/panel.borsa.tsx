import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Sliders, 
  Activity, 
  Sparkles, 
  AlertCircle, 
  Search, 
  ChevronRight,
  MessageSquare
} from 'lucide-react'
import { useUIStore } from '../store/ui'

export const Route = createFileRoute('/panel/borsa')({
  component: BorsaPage,
})

type Stock = {
  code: string;
  name: string;
  last_price: number;
  diff_percent: number;
  volume: number;
}

type StockDetail = {
  limit_up?: number;
  limit_down?: number;
  week_high?: number;
  week_low?: number;
  month_high?: number;
  month_low?: number;
  year_close?: number;
  capital?: number;
  equity?: number;
  circulation_share_ratio?: number;
}

type TASummary = {
  trend: string;
  adx_strength: string;
  rsi: { value: number; status: string };
  macd: string;
  candlestick_patterns: string[];
  atr_stop_loss: number;
  support_resistance: { support: number; resistance: number };
  llm_summary_prompt: string;
}

type HistoryItem = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function BorsaPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  
  // Detail Panel States
  const [selectedStockQuote, setSelectedStockQuote] = useState<Stock | null>(null)
  const [detailData, setDetailData] = useState<StockDetail | null>(null)
  const [taData, setTaData] = useState<TASummary | null>(null)
  const [historyData, setHistoryData] = useState<HistoryItem[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [activePanelTab, setActiveTab] = useState<'fundamental' | 'technical' | 'ai'>('fundamental')

  // Hook into AI sidebar
  const { setGlobalPrompt, openRightSidebar } = useUIStore()

  useEffect(() => {
    async function fetchStocks() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
        const res = await fetch(`${apiUrl}/api/market/stocks`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) setStocks(json.data)
        }
      } catch (err) {
        console.error("Failed to load stocks", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStocks()
  }, [])

  // Fetch detailed information for selected ticker
  useEffect(() => {
    if (!selectedTicker) {
      setSelectedStockQuote(null)
      setDetailData(null)
      setTaData(null)
      setHistoryData([])
      return
    }

    async function fetchAllDetails() {
      setLoadingDetails(true)
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
      
      try {
        // Fetch in parallel to save time
        const [quoteRes, detailRes, taRes, historyRes] = await Promise.allSettled([
          fetch(`${apiUrl}/api/market/symbol/${selectedTicker}`),
          fetch(`${apiUrl}/api/market/symbol/${selectedTicker}/detail`),
          fetch(`${apiUrl}/api/market/symbol/${selectedTicker}/ta/summary`),
          fetch(`${apiUrl}/api/market/symbol/${selectedTicker}/history?limit=100`)
        ])

        if (quoteRes.status === 'fulfilled' && quoteRes.value.ok) {
          const json = await quoteRes.value.json()
          if (json.success && json.data) {
            setSelectedStockQuote(json.data)
          }
        }

        if (detailRes.status === 'fulfilled' && detailRes.value.ok) {
          const json = await detailRes.value.json()
          if (json.success && json.data) {
            setDetailData(json.data)
          }
        } else {
          setDetailData(null)
        }

        if (taRes.status === 'fulfilled' && taRes.value.ok) {
          const json = await taRes.value.json()
          if (json) {
            setTaData(json)
          }
        } else {
          setTaData(null)
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
          const json = await historyRes.value.json()
          if (json.success && json.data) {
            setHistoryData(json.data)
          }
        } else {
          setHistoryData([])
        }

      } catch (err) {
        console.error("Failed to fetch ticker details", err)
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchAllDetails()
  }, [selectedTicker])

  const filteredStocks = stocks.filter(stock => 
    stock.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAskAIInChat = (ticker: string) => {
    setGlobalPrompt(`${ticker} hisse senedinin teknik analiz indikatörleri, destek/direnç noktaları ve genel piyasa durumu hakkında detaylı bir analiz yap.`);
    openRightSidebar();
  }

  // Format large numbers to readable format
  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "-";
    if (num >= 1.0e12) return (num / 1.0e12).toFixed(2) + " T";
    if (num >= 1.0e9) return (num / 1.0e9).toFixed(2) + " Milyar";
    if (num >= 1.0e6) return (num / 1.0e6).toFixed(2) + " Milyon";
    return num.toLocaleString('tr-TR');
  }

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="text-primary" size={24} /> Borsa (Hisse Senetleri)
          </h1>
          <p className="text-sm text-muted-foreground">Piyasadaki hisse senetleri, teknik göstergeler ve AI destekli analizler.</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Hisse kodu veya şirket ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-full text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
      </div>
      
      {/* Split Layout: Stocks Table and Details Panel */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* Left/Center Column: Stocks Table */}
        <div className={`${selectedTicker ? "xl:col-span-7" : "xl:col-span-12"} flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 min-h-[400px]`}>
          <div className="overflow-y-auto flex-1 min-h-0 scrollbar-hide">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/65 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sembol</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Şirket</th>
                  <th className="px-6 py-4 font-semibold text-right">Son Fiyat</th>
                  <th className="px-6 py-4 font-semibold text-right">Değişim (%)</th>
                  <th className="px-6 py-4 font-semibold text-right hidden sm:table-cell">Hacim</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={28} />
                        <span className="text-sm">Borsa verileri yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="text-muted-foreground/60" size={24} />
                        <span>Aradığınız kriterlere uygun hisse bulunamadı.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const isSelected = selectedTicker === stock.code;
                    const isUp = (stock.diff_percent ?? 0) >= 0;
                    return (
                      <tr 
                        key={stock.code} 
                        onClick={() => setSelectedTicker(isSelected ? null : stock.code)}
                        className={`cursor-pointer transition-all border-l-2 ${
                          isSelected 
                            ? "bg-primary/5 border-l-primary" 
                            : "border-l-transparent hover:bg-muted/40"
                        }`}
                      >
                        <td className="px-6 py-3.5 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="text-primary hover:opacity-90">{stock.code}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground truncate max-w-[180px] hidden md:table-cell">{stock.name}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-foreground/90">{stock.last_price?.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-right font-medium">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isUp ? "text-teal-600 dark:text-teal-400 bg-teal-500/10" : "text-destructive bg-destructive/10"
                          }`}>
                            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(stock.diff_percent ?? 0).toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right text-muted-foreground hidden sm:table-cell">
                          {stock.volume ? (stock.volume / 1000000).toFixed(1) + "M" : "-"}
                        </td>
                        <td className="px-4 text-muted-foreground/50">
                          <ChevronRight size={16} className={`transition-transform duration-200 ${isSelected ? "rotate-90 text-primary" : ""}`} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Dynamic Analysis Panel */}
        {selectedTicker && (
          <div className="xl:col-span-5 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-lg relative animate-in slide-in-from-right duration-300">
            
            {/* Panel Header */}
            <div className="p-5 border-b border-border flex items-start justify-between bg-muted/15">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-foreground tracking-tight">{selectedTicker}</span>
                  {selectedStockQuote && (
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      selectedStockQuote.diff_percent >= 0 ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "bg-destructive/10 text-destructive"
                    }`}>
                      {selectedStockQuote.diff_percent >= 0 ? "+" : ""}
                      {selectedStockQuote.diff_percent?.toFixed(2)}%
                    </span>
                  )}
                </div>
                <h3 className="text-xs text-muted-foreground font-medium truncate max-w-[280px]">
                  {selectedStockQuote?.name || "Hisse Senedi Analizi"}
                </h3>
              </div>
              
              <button 
                onClick={() => setSelectedTicker(null)}
                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Price Overlay and Chart Container */}
            <div className="p-5 bg-card shrink-0">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {selectedStockQuote?.last_price?.toFixed(2) || "0.00"}
                </span>
                <span className="text-xs text-muted-foreground font-medium">TRY</span>
              </div>

              {/* Spark Chart Area */}
              <div className="h-32 w-full bg-muted/40 border border-border/60 rounded-xl overflow-hidden relative group/chart flex items-center justify-center">
                {loadingDetails ? (
                  <Loader2 className="animate-spin text-primary/60" size={24} />
                ) : historyData.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Tarihsel fiyat grafiği bulunamadı</span>
                ) : (
                  <>
                    <SVGChart data={historyData} up={(selectedStockQuote?.diff_percent ?? 0) >= 0} />
                    
                    {/* Floating Info Badges */}
                    <div className="absolute top-2.5 left-3 text-[10px] bg-card border border-border rounded px-1.5 py-0.5 text-muted-foreground font-mono">
                      6 Aylık Mum Grafiği
                    </div>
                    
                    {/* Dynamic tooltips/data overlays */}
                    <div className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground/80 font-mono flex gap-2">
                      <span>En Düşük: {Math.min(...historyData.map(h => h.close)).toFixed(1)}</span>
                      <span>En Yüksek: {Math.max(...historyData.map(h => h.close)).toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tabs for Navigation */}
            <div className="px-5 border-b border-border flex gap-2 shrink-0 bg-muted/10">
              <button 
                onClick={() => setActiveTab('fundamental')}
                className={`pb-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activePanelTab === 'fundamental' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Temel Veriler
              </button>
              <button 
                onClick={() => setActiveTab('technical')}
                className={`pb-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activePanelTab === 'technical' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Teknik Sinyaller
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`pb-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePanelTab === 'ai' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles size={12} className={activePanelTab === 'ai' ? "text-primary animate-pulse" : ""} />
                Yapay Zeka
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 min-h-0 scrollbar-hide">
              
              {/* Tab 1: Fundamental Parameters (from IsYatirim) */}
              {activePanelTab === 'fundamental' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="animate-spin text-muted-foreground" size={20} />
                      <span className="text-xs text-muted-foreground">Finansal veriler alınıyor...</span>
                    </div>
                  ) : !detailData ? (
                    <div className="text-center py-12 text-muted-foreground space-y-2">
                      <Info size={20} className="mx-auto text-muted-foreground/60" />
                      <p className="text-xs">İş Yatırım finansal rasyo verilerine ulaşılamadı.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Price limits */}
                      <div className="col-span-2 bg-muted/30 p-4 border border-border/80 rounded-xl">
                        <h4 className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">Günlük Fiyat Marjı</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <span className="block text-[11px] text-destructive font-semibold mb-0.5">Taban Limit</span>
                            <span className="text-lg font-bold text-foreground font-mono">{detailData.limit_down?.toFixed(2) || "-"}</span>
                          </div>
                          <div className="h-8 w-[1px] bg-border" />
                          <div className="text-center flex-1">
                            <span className="block text-[11px] text-teal-600 dark:text-teal-400 font-semibold mb-0.5">Tavan Limit</span>
                            <span className="text-lg font-bold text-foreground font-mono">{detailData.limit_up?.toFixed(2) || "-"}</span>
                          </div>
                        </div>
                      </div>

                      {/* 52-week High/Low */}
                      <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-3">
                        <h4 className="text-xs text-muted-foreground font-bold uppercase tracking-wider">52 Haftalık Seviyeler</h4>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">En Düşük</span>
                            <span className="font-semibold text-foreground/80 font-mono">{detailData.week_low?.toFixed(2) || "-"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">En Yüksek</span>
                            <span className="font-semibold text-foreground/80 font-mono">{detailData.week_high?.toFixed(2) || "-"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Month High/Low */}
                      <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-3">
                        <h4 className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Aylık Seviyeler</h4>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">En Düşük</span>
                            <span className="font-semibold text-foreground/80 font-mono">{detailData.month_low?.toFixed(2) || "-"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">En Yüksek</span>
                            <span className="font-semibold text-foreground/80 font-mono">{detailData.month_high?.toFixed(2) || "-"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Company valuation details */}
                      <div className="col-span-2 bg-muted/30 p-4 border border-border/80 rounded-xl space-y-3">
                        <h4 className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Sermaye ve Yapı</h4>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                          <div className="space-y-0.5">
                            <span className="block text-[11px] text-muted-foreground">Ödenmiş Sermaye</span>
                            <span className="text-xs font-semibold text-foreground/80">{formatNumber(detailData.capital)}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="block text-[11px] text-muted-foreground">Özsermaye</span>
                            <span className="text-xs font-semibold text-foreground/80">{formatNumber(detailData.equity)}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="block text-[11px] text-muted-foreground">Yıl Sonu Kapanışı</span>
                            <span className="text-xs font-semibold text-foreground/80 font-mono">{detailData.year_close?.toFixed(2) || "-"}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="block text-[11px] text-muted-foreground">Halka Açıklık Oranı</span>
                            <span className="text-xs font-semibold text-foreground/80">
                              {detailData.circulation_share_ratio ? `% ${detailData.circulation_share_ratio.toFixed(2)}` : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Technical Indicators (Postgres engine) */}
              {activePanelTab === 'technical' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="animate-spin text-muted-foreground" size={20} />
                      <span className="text-xs text-muted-foreground">Teknik göstergeler hesaplanıyor...</span>
                    </div>
                  ) : !taData ? (
                    <div className="text-center py-12 text-muted-foreground space-y-2">
                      <Sliders size={20} className="mx-auto text-muted-foreground/60" />
                      <p className="text-xs">Postgres veri tabanında teknik analiz hesaplanamadı.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Trend and ADX summary */}
                      <div className="bg-muted/30 p-4 border border-border/80 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-muted-foreground font-bold uppercase block mb-1">Piyasa Trendi</span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                            taData.trend.includes("Bullish") 
                              ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                              : taData.trend.includes("Bearish") 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {taData.trend.includes("Bullish") ? <TrendingUp size={14} /> : taData.trend.includes("Bearish") ? <TrendingDown size={14} /> : <Info size={14} />}
                            {taData.trend}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground font-bold uppercase block mb-1">ADX Sinyal Gücü</span>
                          <span className="text-xs font-semibold text-foreground/80">{taData.adx_strength}</span>
                        </div>
                      </div>

                      {/* RSI Gauge (Beautiful custom gradient bar) */}
                      <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-muted-foreground font-bold uppercase">RSI Göstergesi</span>
                          <span className={`text-xs font-extrabold ${
                            taData.rsi.value > 70 ? "text-destructive" : taData.rsi.value < 30 ? "text-teal-600 dark:text-teal-400" : "text-foreground"
                          }`}>
                            {taData.rsi.value} ({taData.rsi.status})
                          </span>
                        </div>
                        {/* Custom visual range bar */}
                        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/40 via-muted to-destructive/40" />
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-card border-2 border-border shadow-sm transition-all duration-500" 
                            style={{ left: `${Math.min(Math.max(taData.rsi.value, 0), 100)}%`, transform: "translate(-50%, -50%)" }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>30 (Aşırı Satım)</span>
                          <span>50 (Nötr)</span>
                          <span>70 (Aşırı Alım)</span>
                        </div>
                      </div>

                      {/* MACD Sinyali */}
                      <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-1">
                        <span className="text-[11px] text-muted-foreground font-bold uppercase block">MACD (12, 26, 9)</span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
                          <Sliders size={14} className="text-primary" />
                          <span>{taData.macd}</span>
                        </div>
                      </div>

                      {/* Support & Resistance (Bollinger Bands range) */}
                      <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[11px] text-muted-foreground font-bold uppercase">Destek / Direnç Seviyeleri</span>
                          <span className="text-[11px] text-muted-foreground/80 font-mono">
                            BB (20, 2)
                          </span>
                        </div>
                        {/* Custom Bollinger position bar */}
                        <div className="relative h-2 w-full rounded-full bg-muted">
                          {selectedStockQuote && (
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-border shadow-sm"
                              style={{ 
                                left: `${
                                  ((selectedStockQuote.last_price - taData.support_resistance.support) / 
                                  (taData.support_resistance.resistance - taData.support_resistance.support || 1)) * 100
                                }%`, 
                                transform: "translate(-50%, -50%)" 
                              }}
                            />
                          )}
                        </div>
                        <div className="flex justify-between text-[11px] font-mono font-semibold">
                          <div className="text-destructive flex flex-col">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase">Destek (BBL)</span>
                            <span>{taData.support_resistance.support.toFixed(2)}</span>
                          </div>
                          <div className="text-teal-600 dark:text-teal-400 flex flex-col items-end">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase text-right">Direnç (BBU)</span>
                            <span>{taData.support_resistance.resistance.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Suggested Stop Loss (ATR) */}
                      <div className="bg-destructive/5 p-4 border border-destructive/20 rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-destructive font-extrabold uppercase flex items-center gap-1.5">
                            <AlertCircle size={12} /> Bilimsel Stop-Loss (1.5x ATR)
                          </span>
                          <p className="text-[10px] text-muted-foreground">ATR göstergesi temel alınarak hesaplanan koruyucu limit.</p>
                        </div>
                        <span className="text-lg font-bold text-destructive font-mono whitespace-nowrap">
                          {taData.atr_stop_loss.toFixed(2)} TRY
                        </span>
                      </div>

                      {/* Candlestick patterns detected */}
                      <div className="bg-muted/30 p-4 border border-border/80 rounded-xl space-y-2">
                        <span className="text-[11px] text-muted-foreground font-bold uppercase block">Son Mum Formasyonları</span>
                        {taData.candlestick_patterns.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Dün kayda değer bir formasyon gözlemlenmedi.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {taData.candlestick_patterns.map((pattern, i) => (
                              <span key={i} className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
                                {pattern}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Artificial Intelligence Analysis */}
              {activePanelTab === 'ai' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="animate-spin text-muted-foreground" size={20} />
                      <span className="text-xs text-muted-foreground">Yapay Zeka analizi hazırlanıyor...</span>
                    </div>
                  ) : !taData ? (
                    <div className="text-center py-12 text-muted-foreground space-y-2">
                      <Sparkles size={20} className="mx-auto text-muted-foreground/60" />
                      <p className="text-xs">Postgres veri tabanında teknik özet bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      
                      {/* LLM Text Card */}
                      <div className="bg-primary/5 border border-primary/20 shadow-xs p-5 rounded-2xl relative overflow-hidden group">
                        {/* Decorative background grid/glowing effect */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full" />
                        
                        <div className="flex items-center gap-2 mb-3.5">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles size={13} className="animate-pulse" />
                          </div>
                          <span className="text-xs font-bold text-primary uppercase tracking-widest">Sumo AI Özet Analizi</span>
                        </div>
                        
                        <p className="text-sm text-foreground leading-relaxed font-light">
                          {taData.llm_summary_prompt}
                        </p>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => handleAskAIInChat(selectedTicker)}
                          className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <MessageSquare size={14} />
                          Araştırma Panelinde Sohbet Et
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  )
}

function SVGChart({ data, up }: { data: HistoryItem[], up: boolean }) {
  if (!data || data.length === 0) return null;
  const prices = data.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  const padding = range * 0.05; // 5% padding
  const minPadded = min - padding;
  const maxPadded = max + padding;
  const rangePadded = maxPadded - minPadded;

  const width = 500;
  const height = 120;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.close - minPadded) / (rangePadded || 1)) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const color = up ? "oklch(0.65 0.13 145)" : "oklch(0.5248 0.1368 20.8317)";

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGradient)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Loader2, DollarSign, Euro, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/forex/')({
  component: ForexPage,
})

type MarketItem = {
  code: string;
  display_name: string;
  last_price: number;
  diff_percent: number;
  category: string;
}

function ForexPage() {
  const [data, setData] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchForexData() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787"
        const res = await fetch(`${apiUrl}/api/market/summary`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) setData(json.data)
        }
      } catch (err) {
        console.error("Forex data fetch failed", err)
      } finally {
        setLoading(false)
      }
    }
    fetchForexData()
  }, [])

  // Kartlar için USD/TRY, EUR/TRY ve DXY filtrelemesi
  const cardSymbols = ["USDTRY", "EURTRY", "DXY"]
  const cards = cardSymbols.map(sym => data.find(item => item.code === sym)).filter(Boolean) as MarketItem[]

  // Tabloda gösterilecek pariteler (forex kategorisindekiler + DXY)
  const tableItems = data.filter(item => item.category === "forex" || item.code === "DXY" || item.code === "EURUSD")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Forex Piyasaları</h1>
        <p className="text-sm text-zinc-400">Canlı döviz kurları, global pariteler ve teknik görünüm.</p>
      </div>

      {/* Canlı Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
          ))
        ) : (
          cards.map(card => {
            const isUp = card.diff_percent >= 0
            const Icon = card.code === "EURTRY" ? Euro : card.code === "USDTRY" ? DollarSign : BarChart3
            
            return (
              <div 
                key={card.code}
                onClick={() => navigate({ to: `/forex/${card.code}` })}
                className="bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-300 shadow-md group hover:scale-[1.02]"
              >
                <div className="space-y-2">
                  <span className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">{card.display_name}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-zinc-100 tracking-tight">{card.last_price?.toFixed(4)}</span>
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {isUp ? "+" : ""}{card.diff_percent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"} group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Parite Tablosu */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/20">
          <h2 className="text-sm font-semibold text-zinc-300">Başlıca Döviz Pariteleri</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Sembol</th>
                <th className="px-6 py-4 font-medium">Enstrüman Adı</th>
                <th className="px-6 py-4 font-medium text-right">Fiyat</th>
                <th className="px-6 py-4 font-medium text-right">Değişim (%)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="animate-spin inline-block mr-2" size={20} />
                    Veriler yükleniyor...
                  </td>
                </tr>
              ) : tableItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    Gösterilecek aktif parite bulunamadı.
                  </td>
                </tr>
              ) : (
                tableItems.map((item) => {
                  const isUp = item.diff_percent >= 0
                  return (
                    <tr 
                      key={item.code} 
                      onClick={() => navigate({ to: `/forex/${item.code}` })}
                      className="border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3.5 font-bold text-emerald-400">{item.code}</td>
                      <td className="px-6 py-3.5 text-zinc-300 font-medium">{item.display_name}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-zinc-100">{item.last_price?.toFixed(4)}</td>
                      <td className="px-6 py-3.5 text-right font-medium">
                        <div className={`flex items-center justify-end gap-1 ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {Math.abs(item.diff_percent ?? 0).toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

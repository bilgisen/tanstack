import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/borsa')({
  component: BorsaPage,
})

type Stock = {
  code: string;
  name: string;
  last_price: number;
  diff_percent: number;
  volume: number;
}

function BorsaPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStocks() {
      try {
        const apiUrl = import.meta.env.VITE_HONO_API_URL || "http://127.0.0.1:8787"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Borsa (Hisse Senetleri)</h1>
        <p className="text-sm text-zinc-400">BIST 100, BIST 30 ve global hisse senetleri.</p>
      </div>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Sembol</th>
                <th className="px-6 py-4 font-medium">Şirket</th>
                <th className="px-6 py-4 font-medium text-right">Son Fiyat</th>
                <th className="px-6 py-4 font-medium text-right">Değişim (%)</th>
                <th className="px-6 py-4 font-medium text-right">Hacim</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="animate-spin inline-block mr-2" size={20} />
                    Veriler yükleniyor...
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Henüz veri bulunamadı veya piyasa kapalı.
                  </td>
                </tr>
              ) : (
                stocks.slice(0, 50).map((stock) => (
                  <tr key={stock.code} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-emerald-400">{stock.code}</td>
                    <td className="px-6 py-3 text-zinc-300 truncate max-w-[200px]">{stock.name}</td>
                    <td className="px-6 py-3 text-right font-medium text-zinc-100">{stock.last_price?.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right font-medium">
                      <div className={`flex items-center justify-end gap-1 ${(stock.diff_percent ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {(stock.diff_percent ?? 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(stock.diff_percent ?? 0).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-zinc-400">
                      {stock.volume ? (stock.volume / 1000000).toFixed(1) + "M" : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

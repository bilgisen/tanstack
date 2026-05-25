import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2, 
  Trash2, 
  Plus, 
  FolderPlus,
  AlertCircle, 
  Search, 
  Star,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import { useUIStore } from '../store/ui'
import { useWatchlistStore } from '../store/watchlist'

export const Route = createFileRoute('/panel/takip-listesi')({
  component: WatchlistPage,
})

type MarketItem = {
  code: string;
  name: string;
  last_price: number;
  diff_percent: number;
  volume?: number;
  type: 'stock' | 'index';
}

function WatchlistPage() {
  const { 
    watchlists, 
    activeWatchlistId, 
    setActiveWatchlistId, 
    addWatchlist, 
    deleteWatchlist, 
    addItem, 
    removeItem 
  } = useWatchlistStore()

  const { setGlobalPrompt, openRightSidebar } = useUIStore()

  const [loading, setLoading] = useState(true)
  const [marketItems, setMarketItems] = useState<Record<string, MarketItem>>({})
  
  // Create Watchlist State
  const [newListName, setNewListName] = useState("")
  const [isCreatingList, setIsCreatingList] = useState(false)
  
  // Search to Add State
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Fetch all stocks and summary from API
  useEffect(() => {
    async function fetchMarketData() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
      const itemsMap: Record<string, MarketItem> = {}

      // Fetch Stocks
      try {
        const res = await fetch(`${apiUrl}/api/market/stocks`)
        if (res.ok) {
          const json = await res.json()
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach((stock: any) => {
              itemsMap[stock.code.toUpperCase()] = {
                code: stock.code,
                name: stock.name,
                last_price: stock.last_price || 0,
                diff_percent: stock.diff_percent || 0,
                volume: stock.volume,
                type: 'stock'
              }
            })
          }
        }
      } catch (err) {
        console.error("Failed to load stocks for watchlist", err)
      }

      // Fetch Indices / Summary
      try {
        const resIndices = await fetch(`${apiUrl}/api/market/summary`)
        if (resIndices.ok) {
          const json = await resIndices.json()
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach((index: any) => {
              itemsMap[index.code.toUpperCase()] = {
                code: index.code,
                name: index.name || index.title || `${index.code} Endeksi`,
                last_price: index.last_price || 0,
                diff_percent: index.diff_percent || 0,
                type: 'index'
              }
            })
          }
        }
      } catch (err) {
        console.error("Failed to load indices for watchlist", err)
      }

      setMarketItems(itemsMap)
      setLoading(false)
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const activeList = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0]

  if (!activeList) return null

  // Filter list items based on the active watchlist items
  const activeListDetailedItems = activeList.items.map(item => {
    const detail = marketItems[item.symbol.toUpperCase()]
    if (detail) {
      return detail
    }
    // Fallback if API hasn't loaded this item or we don't have detail
    return {
      code: item.symbol,
      name: item.type === 'index' ? `${item.symbol} Endeksi` : "Yükleniyor...",
      last_price: 0,
      diff_percent: 0,
      type: item.type
    } as MarketItem
  })

  // Filter global stocks/indices for search autocomplete
  const availableToAdd = Object.values(marketItems).filter(item => {
    // Exclude items already in the active watchlist
    const alreadyInList = activeList.items.some(wlItem => wlItem.symbol.toUpperCase() === item.code.toUpperCase())
    if (alreadyInList) return false

    if (!searchQuery) return false

    return (
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }).slice(0, 5) // limit to top 5 results

  const handleCreateListSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return
    const id = addWatchlist(newListName)
    if (id) {
      setNewListName("")
      setIsCreatingList(false)
    }
  }

  const handleAddItemToList = (item: MarketItem) => {
    addItem(activeList.id, item.code, item.type)
    setSearchQuery("")
    setIsSearchFocused(false)
  }

  const handleAskAllAI = () => {
    if (activeList.items.length === 0) return
    const symbolsStr = activeList.items.map(item => item.symbol).join(", ")
    setGlobalPrompt(`Takip listem olan "${activeList.name}" listesindeki varlıklar şunlar: ${symbolsStr}. Bu hisse ve endekslerin genel piyasa durumu, son teknik analizleri ve potansiyelleri hakkında kapsamlı bir değerlendirme sunar mısın?`);
    openRightSidebar();
  }

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500/10" size={24} /> Takip Listeleri
          </h1>
          <p className="text-sm text-muted-foreground">Kendi özel takip listelerinizi oluşturun, borsa ve endeks hareketlerini anlık izleyin.</p>
        </div>

        {/* AI Analyze Watchlist Button */}
        {activeList.items.length > 0 && (
          <button
            onClick={handleAskAllAI}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-[#0e75ec] hover:bg-[#0c62bd] text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs"
          >
            <Sparkles size={14} className="animate-pulse" />
            Sohbette Listeyi Analiz Et
          </button>
        )}
      </div>

      {/* Tabs and Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/80 gap-3 pb-px shrink-0">
        
        {/* Watchlist Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {watchlists.map((list) => {
            const isActive = list.id === activeWatchlistId
            return (
              <button
                key={list.id}
                onClick={() => setActiveWatchlistId(list.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
              >
                {list.name}
              </button>
            )
          })}

          {/* New List Trigger Button */}
          {!isCreatingList && (
            <button
              onClick={() => setIsCreatingList(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-xs font-semibold transition-all border border-dashed border-border/80 hover:border-border cursor-pointer whitespace-nowrap"
            >
              <FolderPlus size={12} />
              <span>Yeni Liste</span>
            </button>
          )}
        </div>

        {/* Delete Watchlist option if not default */}
        {!activeList.isDefault && (
          <button
            onClick={() => deleteWatchlist(activeList.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-destructive/80 hover:text-destructive self-end sm:self-auto cursor-pointer pb-2 sm:pb-0"
          >
            <Trash2 size={13} />
            <span>Listeyi Sil</span>
          </button>
        )}
      </div>

      {/* Inline Create List Dialog */}
      {isCreatingList && (
        <form onSubmit={handleCreateListSubmit} className="bg-card border border-primary/20 p-4 rounded-xl flex items-center gap-3 shrink-0 animate-in slide-in-from-top-4 duration-200">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Yeni Liste Adı</label>
            <input
              type="text"
              required
              placeholder="Örn: Teknoloji Hisseleri, Bankalar..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-foreground text-xs focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-2 self-end">
            <button
              type="submit"
              className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Oluştur
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingList(false)}
              className="h-9 px-3 bg-muted text-muted-foreground text-xs font-bold rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
        
        {/* Table Column */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-h-[300px]">
          
          {/* Sub Header Search to Add */}
          <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/10">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {activeList.name} ({activeList.items.length} varlık)
            </span>

            {/* Search Input with dropdown to add to active watchlist */}
            <div className="relative w-full sm:w-72">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input
                  type="text"
                  placeholder="Hisse veya endeks ekle..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-9 pr-4 bg-background border border-border rounded-lg text-foreground text-xs placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Autocomplete Dropdown list */}
              {isSearchFocused && searchQuery && availableToAdd.length > 0 && (
                <div className="absolute top-9 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-1.5 divide-y divide-border/20">
                    {availableToAdd.map(item => (
                      <button
                        key={item.code}
                        onMouseDown={() => handleAddItemToList(item)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground font-mono">{item.code}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                          {item.type === 'index' ? 'Endeks' : 'Hisse'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Watchlist Table */}
          <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/65 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sembol</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">İsim</th>
                  <th className="px-6 py-4 font-semibold text-right">Fiyat (TRY)</th>
                  <th className="px-6 py-4 font-semibold text-right">Günlük Değişim</th>
                  <th className="px-6 py-4 font-semibold text-right hidden sm:table-cell">Tip</th>
                  <th className="w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <span className="text-xs">Takip listesi verileri yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : activeListDetailedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                        <Star className="text-muted-foreground/30 fill-muted-foreground/5" size={40} />
                        <span className="text-xs font-medium text-muted-foreground">Bu liste şu anda boş. Üstteki ekleme kutusunu kullanarak hisse veya endeks ekleyebilirsiniz.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeListDetailedItems.map((item) => {
                    const isUp = item.diff_percent >= 0
                    const itemUrl = item.type === 'index' 
                      ? `/panel/endeksler/${item.code === 'XU100' ? 'bist100' : item.code === 'XU030' ? 'bist30' : 'bist100'}`
                      : `/panel/sirketler/${item.code.toLowerCase()}`
                    return (
                      <tr 
                        key={item.code} 
                        className="hover:bg-muted/40 transition-colors group"
                      >
                        <td className="px-6 py-3.5 font-bold text-foreground">
                          <Link to={itemUrl as any} className="text-primary hover:underline font-mono">
                            {item.code}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground truncate max-w-[200px] hidden md:table-cell">{item.name}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-foreground/90 font-mono">
                          {item.last_price > 0 ? item.last_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) : "-"}
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium">
                          {item.last_price > 0 ? (
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                              isUp ? "text-teal-600 dark:text-teal-400 bg-teal-500/10" : "text-destructive bg-destructive/10"
                            }`}>
                              {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              {Math.abs(item.diff_percent).toFixed(2)}%
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right text-muted-foreground text-xs hidden sm:table-cell font-medium uppercase">
                          {item.type === 'index' ? 'Endeks' : 'Hisse'}
                        </td>
                        <td className="px-4 text-right">
                          <button
                            onClick={() => removeItem(activeList.id, item.code)}
                            className="p-1 hover:text-destructive text-muted-foreground/40 hover:bg-destructive/10 rounded-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Listeden Kaldır"
                          >
                            <Trash2 size={13} />
                          </button>
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

    </div>
  )
}

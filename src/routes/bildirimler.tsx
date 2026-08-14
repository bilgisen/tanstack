import { Link, Outlet, createFileRoute, useMatches } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { AlertCircle, ArrowUpRight, Bell, FileText, Search, Sparkles } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { KAPFeedSkeleton, NotificationCard, scoreVariant } from '../components/kap/NotificationCard'
import { logKAPClick, useKAPFeed, useTrackedSymbols } from '../lib/useKAPData'

export const Route = createFileRoute('/bildirimler')({
  component: BildirimlerPage,
})

const CATEGORIES = ['Tümü', 'FINANCIAL_REPORT', 'MENTION', 'OPERATIONAL', 'DIVIDEND', 'SPEcial_event', 'OTHER']
const IMPORTANCE_OPTIONS = [
  { value: '', label: 'Tüm Önem' },
  { value: 'high', label: 'Yüksek (7-10)' },
  { value: 'medium', label: 'Orta (5-6)' },
  { value: 'low', label: 'Düşük (1-4)' },
]

function BildirimlerPage() {
  const matches = useMatches()
  const hasChildRoute = matches.some(m => m.routeId === '/bildirimler/$disclosureId')

  const [scope, setScope] = useState<'all' | 'bist100' | 'tracked'>('all')
  const [category, setCategory] = useState('Tümü')
  const [importance, setImportance] = useState('')
  const [page, setPage] = useState(1)
  const [stock, setStock] = useState('')

  const tracked = useTrackedSymbols()
  const trackedStocks = scope === 'tracked' && tracked.size > 0 ? [...tracked] : undefined

  const cat = category === 'Tümü' ? undefined : category
  const { data, isLoading, isError, isFetching } = useKAPFeed({
    bist100: scope === 'bist100' || undefined,
    category: cat,
    importance: importance || undefined,
    stock: stock.trim() || undefined,
    stocks: trackedStocks,
    page,
    limit: 25,
    enabled: !hasChildRoute,
  })

  const notifications = data?.notifications ?? []
  const importantToday = useMemo(
    () => notifications.filter(n => (n.importance_score ?? 0) >= 7),
    [notifications]
  )

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 25))

  if (hasChildRoute) return <Outlet />

  return (
    <PublicPageLayout context="bildirimler" placeholder="KAP bildirimleri hakkında bir soru sorun...">
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="text-primary" size={22} />
            KAP Bildirimleri
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kamuyu Aydınlatma Platformu bildirimleri, AI özetleri ve önem skorlarıyla.
          </p>
        </div>

        {importantToday.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm mb-2">
              <Sparkles size={14} />
              Bugünün önemli bildirimleri
            </div>
            <div className="flex flex-wrap gap-2">
              {importantToday.map(n => (
                <Link
                  key={n.disclosure_index}
                  to="/bildirimler/$disclosureId"
                  params={{ disclosureId: n.disclosure_index }}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-xs hover:border-primary/40 transition-colors"
                >
                  <span className="font-semibold text-foreground">{n.title.slice(0, 48)}{n.title.length > 48 ? '…' : ''}</span>
                  <span className={`inline-flex items-center rounded-full border px-1.5 text-[10px] font-bold ${scoreVariant(n.importance_score).cls}`}>
                    {n.importance_score}
                  </span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          to="/gunsonu"
          className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-4 transition-colors hover:border-primary/40"
        >
          <div>
            <div className="text-sm font-semibold text-foreground">Gün Sonu Sentezi</div>
            <div className="text-xs text-muted-foreground mt-0.5">Günün en önemli gelişmeleri tek bakışta — AI özeti.</div>
          </div>
          <ArrowUpRight size={16} className="text-primary shrink-0" />
        </Link>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setScope('all'); setPage(1) }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${scope === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Tümü
            </button>
            <button
              onClick={() => { setScope('bist100'); setPage(1) }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${scope === 'bist100' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              BIST100
            </button>
            <button
              onClick={() => { setScope('tracked'); setPage(1) }}
              disabled={tracked.size === 0}
              title={tracked.size === 0 ? 'Takip listenizde hisse yok — takip listesi sayfasından ekleyin' : `${tracked.size} hisse takipte`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${scope === 'tracked' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Takipte {tracked.size > 0 && <span className="ml-1 opacity-70">({tracked.size})</span>}
            </button>
            <select
              value={importance}
              onChange={(e) => { setImportance(e.target.value); setPage(1) }}
              className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              {IMPORTANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'Tümü' ? c : c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              value={stock}
              onChange={(e) => { setStock(e.target.value); setPage(1) }}
              placeholder="Şirket ara (örn. THYAO)..."
              className="w-full rounded-xl border border-border/60 bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading && <KAPFeedSkeleton count={4} />}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertCircle className="text-destructive" size={28} />
            <p className="text-sm text-muted-foreground">Bildirimler yüklenirken bir sorun oluştu.</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Yeniden Dene
            </button>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 p-10 text-center">
            <FileText className="text-muted-foreground/30" size={32} />
            <p className="text-sm text-muted-foreground">Bu filtrelerle eşleşen bildirim bulunamadı.</p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <>
            <div className="grid gap-3">
              {notifications.map(n => (
                <NotificationCard
                  key={n.disclosure_index}
                  n={n}
                  isImportant={(n.importance_score ?? 0) >= 7}
                  isTracked={(n.tickers ?? []).some(t => tracked.has(t.toUpperCase()))}
                  onClickCard={() => logKAPClick(n.disclosure_index, 'feed_card')}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground/70">
                {data?.total ?? 0} bildirim · Sayfa {page}/{totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40 hover:border-primary/40 transition-colors"
                >
                  ← Önceki
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages || isFetching}
                  className="rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40 hover:border-primary/40 transition-colors"
                >
                  Sonraki →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PublicPageLayout>
  )
}
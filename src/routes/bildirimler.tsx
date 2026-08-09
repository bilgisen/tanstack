import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { AlertCircle, ArrowUpRight, Bell, CalendarClock, FileText, Loader2, Search, Sparkles } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import {  useKAPAnalyze, useKAPFeed } from '../lib/useKAPData'
import type {KAPNotification} from '../lib/useKAPData';

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

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diffH = (now.getTime() - d.getTime()) / 3_600_000
    if (diffH < 24) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
  } catch { return '' }
}

function scoreVariant(score: number | null | undefined) {
  if (score == null) return { label: '-', cls: 'bg-muted text-muted-foreground' }
  if (score >= 8) return { label: String(score), cls: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20' }
  if (score >= 6) return { label: String(score), cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' }
  if (score >= 4) return { label: String(score), cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20' }
  return { label: String(score), cls: 'bg-muted text-muted-foreground' }
}

function NotificationCard({ n, isImportant }: { n: KAPNotification; isImportant?: boolean }) {
  const analyze = useKAPAnalyze(n.disclosure_index)
  const { importance_score, summary_tr, subject, title, is_bist100, disclosure_class, publish_date } = n
  const { label, cls } = scoreVariant(importance_score)

  const firstTicker = n?.analysis?.tickers?.[0]
  return (
    <Link
      to="/bildirimler/$disclosureId"
      params={{ disclosureId: n.disclosure_index }}
      className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all duration-200 animate-in fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {isImportant && (
            <Badge variant="default" className="gap-1 shrink-0">
              <Sparkles size={10} />
              Önemli
            </Badge>
          )}
          {is_bist100 === 1 && (
            <Badge variant="secondary" className="shrink-0">BIST100</Badge>
          )}
          {disclosure_class && (
            <Badge variant="outline" className="text-muted-foreground shrink-0">{disclosure_class}</Badge>
          )}
        </div>
        <div className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>
          {label}
        </div>
      </div>

      <div className="min-w-0 space-y-1">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        {subject && (
          <p className="text-xs text-muted-foreground line-clamp-1">{subject}</p>
        )}
        {summary_tr && (
          <p className="text-xs text-muted-foreground/90 line-clamp-2">{summary_tr}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          <CalendarClock size={12} />
          {formatTime(publish_date)}
          {firstTicker && <span className="font-semibold">· {firstTicker}</span>}
        </div>
        {importance_score == null && (
          <button
            onClick={(e) => { e.preventDefault(); analyze.mutate() }}
            disabled={analyze.isPending}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 disabled:opacity-50"
          >
            {analyze.isPending ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {analyze.isPending ? 'Analiz ediliyor...' : 'AI Analiz'}
          </button>
        )}
      </div>
    </Link>
  )
}

function FeedSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  )
}

function BildirimlerPage() {
  const [bist100Only, setBist100Only] = useState(false)
  const [category, setCategory] = useState('Tümü')
  const [importance, setImportance] = useState('')
  const [page, setPage] = useState(1)
  const [stock, setStock] = useState('')

  const cat = category === 'Tümü' ? undefined : category
  const { data, isLoading, isError, isFetching } = useKAPFeed({
    bist100: bist100Only || undefined,
    category: cat,
    importance: importance || undefined,
    stock: stock.trim() || undefined,
    page,
    limit: 25,
  })

  const notifications = data?.notifications ?? []
  const importantToday = useMemo(
    () => notifications.filter(n => (n.importance_score ?? 0) >= 7),
    [notifications]
  )

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 25))

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

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setBist100Only(false); setPage(1) }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${!bist100Only ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Tümü
            </button>
            <button
              onClick={() => { setBist100Only(true); setPage(1) }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${bist100Only ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              BIST100
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
        {isLoading && <FeedSkeleton count={4} />}

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
                <NotificationCard key={n.disclosure_index} n={n} isImportant={(n.importance_score ?? 0) >= 7} />
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
import { Link } from '@tanstack/react-router'
import { CalendarClock, Loader2, Sparkles, Star } from 'lucide-react'
import { Badge } from '../ui/badge'
import {  useKAPAnalyze } from '../../lib/useKAPData'
import type {KAPNotification} from '../../lib/useKAPData';

export function formatKAPTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diffH = (now.getTime() - d.getTime()) / 3_600_000
    if (diffH < 24) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
  } catch { return '' }
}

export function scoreVariant(score: number | null | undefined) {
  if (score == null) return { label: '-', cls: 'bg-muted text-muted-foreground' }
  if (score >= 8) return { label: String(score), cls: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20' }
  if (score >= 6) return { label: String(score), cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' }
  if (score >= 4) return { label: String(score), cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20' }
  return { label: String(score), cls: 'bg-muted text-muted-foreground' }
}

export function NotificationCard({ n, isImportant, isTracked, onClickCard }: { n: KAPNotification; isImportant?: boolean; isTracked?: boolean; onClickCard?: () => void }) {
  const analyze = useKAPAnalyze(n.disclosure_index)
  const { importance_score, summary_tr, subject, title, is_bist100, disclosure_class, publish_date } = n
  const { label, cls } = scoreVariant(importance_score)

  const firstTicker = n?.analysis?.tickers?.[0]
  return (
    <Link
      to="/kap-bildirimleri/$disclosureId"
      params={{ disclosureId: n.disclosure_index }}
      onClick={onClickCard}
      className={`group flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all duration-200 animate-in fade-in hover:shadow-md ${isTracked ? 'border-primary/40 hover:border-primary/70' : 'border-border/60 hover:border-primary/40'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {isTracked && (
            <Badge variant="default" className="gap-1 shrink-0 bg-primary/10 text-primary border-primary/20">
              <Star size={10} className="fill-current" />
              Takip
            </Badge>
          )}
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
          {formatKAPTime(publish_date)}
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

export function KAPFeedSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 p-4 space-y-3">
          <div className="flex justify-between">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-5 w-10 rounded-full" />
          </div>
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
}
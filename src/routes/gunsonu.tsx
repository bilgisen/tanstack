import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AlertCircle, ArrowUpRight, CalendarDays, Newspaper, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { logKAPClick, trTodayISO, useDailySynthesis } from '../lib/useKAPData'
import type {DailySynthesisItem} from '../lib/useKAPData';

export const Route = createFileRoute('/gunsonu')({
  component: GunSonuPage,
})

const YON_META: Record<DailySynthesisItem['yon'], { label: string; cls: string; icon: typeof TrendingUp }> = {
  olumlu: { label: 'Olumlu', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: TrendingUp },
  olumsuz: { label: 'Olumsuz', cls: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400', icon: TrendingDown },
  notr: { label: 'Nötr', cls: 'border-border/60 bg-muted text-muted-foreground', icon: ArrowUpRight },
}

function GunSonuPage() {
  const [date, setDate] = useState(trTodayISO())

  useEffect(() => {
    logKAPClick('', 'daily_view')
  }, [])

  const { data, isLoading, isError, refetch, isFetching } = useDailySynthesis(date)
  const formatted = date.split('-').reverse().join('.')

  const items = data?.items ?? []
  const headline = data?.headline ?? ''
  const overlooked = data?.overlooked ?? []

  return (
    <PublicPageLayout context="bildirimler" placeholder="Gün sonu sentezi hakkında bir soru sorun...">
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Newspaper className="text-primary" size={22} />
              Gün Sonu Sentezi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Günün en önemli KAP gelişmeleri — AI destekli özet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDate(trTodayISO())}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${date === trTodayISO() ? 'bg-primary text-primary-foreground' : 'border-border/60 text-foreground hover:border-primary/40'}`}
            >
              Bugün
            </button>
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="rounded-xl border border-border/60 bg-background pl-8 pr-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
            {[0, 1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse" />)}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertCircle className="text-destructive" size={28} />
            <p className="text-sm text-muted-foreground">Bu gün için sentez henüz hazır değil (analizler akşam üretilir) ya da bir sorun oluştu.</p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isFetching ? 'Yükleniyor…' : 'Yeniden Dene'}
            </button>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-5">
              <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wide mb-2">
                <Sparkles size={14} />
                {formatted} · Özet
              </div>
              <p className="text-lg md:text-xl font-semibold leading-snug">{headline}</p>
            </div>

            <div className="grid gap-3">
              {items.map((item, i) => {
                const meta = YON_META[item.yon] ?? YON_META.notr
                const Icon = meta.icon
                return (
                  <div key={`${item.ticker}-${i}`} className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Link
                        to="/hisse/$ticker"
                        params={{ ticker: item.ticker }}
                        className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {item.ticker}
                        <ArrowUpRight size={13} className="opacity-50" />
                      </Link>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}>
                        <Icon size={11} />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.neOldu}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      <span className="font-semibold text-foreground/70">Neden önemli: </span>
                      {item.nedenOnemli}
                    </p>
                  </div>
                )
              })}
            </div>

            {overlooked.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Gözden kaçmasın
                </div>
                <ul className="space-y-1.5">
                  {overlooked.map((o, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary/60 mt-0.5">•</span>
                      <span className="leading-relaxed">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </PublicPageLayout>
  )
}

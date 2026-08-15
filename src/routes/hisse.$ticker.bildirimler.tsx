import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarClock, ChevronRight, FileText, Landmark, Sparkles } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { useKAPCompany } from '../lib/useKAPData'

export const Route = createFileRoute('/hisse/$ticker/bildirimler')({
  component: CompanyNotificationsPage,
})

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

function fmtTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diffH = (now.getTime() - d.getTime()) / 3_600_000
    if (diffH < 24) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return fmtDate(dateStr)
  } catch { return '' }
}

function scoreCls(score: number | null | undefined): string {
  if (score == null) return 'bg-muted text-muted-foreground'
  if (score >= 8) return 'bg-red-500/15 text-red-600 dark:text-red-400'
  if (score >= 6) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
  if (score >= 4) return 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
  return 'bg-muted text-muted-foreground'
}

function CompanyNotificationsPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const { data, isLoading, isError } = useKAPCompany(tickerUpper, 90)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText size={36} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">{tickerUpper} için KAP bildirimi bulunamadı.</p>
      </div>
    )
  }

  const latestReport = data.latest_financial_report

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      {/* Latest financial report spotlight */}
      {latestReport && (
        <Link
          to="/kap-bildirimleri/$disclosureId"
          params={{ disclosureId: latestReport.disclosure_index }}
          className="group flex items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-4 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="rounded-full bg-primary/15 p-2.5 shrink-0">
            <Landmark size={18} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-primary">Son Finansal Rapor</span>
              <Badge variant="outline" className="text-[10px]">Finansal Rapor</Badge>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{latestReport.summary_tr || latestReport.title || `${tickerUpper} finansal rapor`}</p>
            <p className="text-[11px] text-muted-foreground/70">{fmtDate(latestReport.publish_date)}</p>
          </div>
          <div className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${scoreCls(latestReport.importance_score)}`}>
            {latestReport.importance_score ?? '-'}
          </div>
          <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </Link>
      )}

      {/* Notifications list */}
      {data.notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border/50 bg-card/50">
          <FileText size={32} className="text-muted-foreground/25 mb-3" />
          <p className="text-sm text-muted-foreground">Son 90 günde {tickerUpper} için KAP bildirimi bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.notifications.map((n) => (
            <Link
              key={n.disclosure_index}
              to="/kap-bildirimleri/$disclosureId"
              params={{ disclosureId: n.disclosure_index }}
              className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-3.5 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {n.is_bist100 === 1 && <Badge variant="secondary" className="text-[10px]">BIST100</Badge>}
                  {n.disclosure_class && <Badge variant="outline" className="text-[10px] text-muted-foreground">{n.disclosure_class}</Badge>}
                  {n.is_late === 1 && <Badge variant="destructive" className="text-[10px]">Geç</Badge>}
                  {n.is_changed === 1 && <Badge variant="secondary" className="text-[10px]">Düzeltilmiş</Badge>}
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.summary_tr || n.subject}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <CalendarClock size={11} />
                  {fmtTime(n.publish_date)}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                {n.importance_score != null ? (
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${scoreCls(n.importance_score)}`}>
                    {n.importance_score}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <Sparkles size={11} />
                    Analiz
                  </span>
                )}
                <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
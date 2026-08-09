import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Clock, ExternalLink, FileText, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { useKAPAnalyze, useKAPDetail } from '../lib/useKAPData'

export const Route = createFileRoute('/bildirimler/$disclosureId')({
  component: BildirimDetayPage,
})

const CATEGORY_LABELS: Record<string, string> = {
  FINANCIAL_REPORT: 'Finansal Rapor',
  MENTION: 'Yönetim Kararı',
  OPERATIONAL: 'Operasyonel',
  DIVIDEND: 'Temettü',
  SPEcial_event: 'Özel Durum',
  BOARD_DECISION: 'Yönetim Kararı',
  OTHER: 'Diğer',
}

function scoreColor(score: number | null | undefined) {
  if (score == null) return 'bg-muted text-muted-foreground'
  if (score >= 8) return 'bg-red-500/15 text-red-600 dark:text-red-400'
  if (score >= 6) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
  if (score >= 4) return 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
  return 'bg-muted text-muted-foreground'
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}

function BildirimDetayPage() {
  const { disclosureId } = Route.useParams()
  const { data: d, isLoading, isError } = useKAPDetail(disclosureId)
  const analyze = useKAPAnalyze(disclosureId)

  if (isLoading) {
    return (
      <PublicPageLayout context={`bildirim:${disclosureId}`} placeholder="Bu bildirim hakkında bir soru sorun...">
        <DetailSkeleton />
      </PublicPageLayout>
    )
  }

  if (isError || !d) {
    return (
      <PublicPageLayout context={`bildirim:${disclosureId}`} placeholder="Bu bildirim hakkında bir soru sorun...">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <AlertCircle className="text-destructive" size={28} />
          <p className="text-sm text-muted-foreground">Bildirim bulunamadı veya yüklenemedi.</p>
          <Link to="/bildirimler" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
            <ArrowLeft size={12} className="inline mr-1" />Bildirimlere Dön
          </Link>
        </div>
      </PublicPageLayout>
    )
  }

  const hasAnalysis = d.importance_score != null
  const issue = d.is_late === 1
  const changed = d.is_changed === 1

  return (
    <PublicPageLayout context={`bildirim:${disclosureId}`} placeholder="Bu bildirim hakkında bir soru sorun...">
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">
        <Link
          to="/bildirimler"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Bildirimlere Dön
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {d.is_bist100 === 1 && <Badge variant="secondary">BIST100</Badge>}
            {d.disclosure_class && <Badge variant="outline">{d.disclosure_class}</Badge>}
            {CATEGORY_LABELS[d.analysis?.category || d.disclosure_category || ''] && (
              <Badge variant="outline">{CATEGORY_LABELS[d.analysis?.category || d.disclosure_category || '']}</Badge>
            )}
            {issue && <Badge variant="destructive">Geç Bildirim</Badge>}
            {changed && <Badge variant="secondary">Düzeltilmiş</Badge>}
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-snug">{d.title}</h1>
          {d.subject && <p className="text-sm text-muted-foreground">{d.subject}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
            <span className="inline-flex items-center gap-1"><Clock size={12} /> {formatDateTime(d.publish_date)}</span>
            {d.tickers && d.tickers.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                {d.tickers.map(t => (
                  <Link
                    key={t}
                    to="/hisse/$ticker"
                    params={{ ticker: t }}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t}
                  </Link>
                ))}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {d.pdf_link && (
              <a
                href={d.pdf_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-2 text-xs font-semibold hover:border-primary/40 transition-colors"
              >
                <FileText size={13} /> Orijinal PDF <ExternalLink size={11} className="opacity-60" />
              </a>
            )}
            {d.kap_link && (
              <a
                href={d.kap_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-2 text-xs font-semibold hover:border-primary/40 transition-colors"
              >
                KAP'ta Aç <ExternalLink size={11} className="opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {hasAnalysis ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles size={15} className="text-primary" />
                  AI Analizi
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${scoreColor(d.importance_score)}`}>
                  Önem: {d.importance_score}
                </span>
              </div>

              {d.summary_tr && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Özet</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{d.summary_tr}</p>
                </div>
              )}

              {d.impact_analysis && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Etki Analizi</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{d.impact_analysis}</p>
                </div>
              )}

              {d.key_numbers && Array.isArray(d.key_numbers) && d.key_numbers.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Anahtar Rakamlar</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {d.key_numbers.map((k, i) => {
                      const entry = k
                      const keys = Object.keys(entry)
                      return (
                        <div key={i} className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
                          {keys.map(kk => (
                            <div key={kk} className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground">{kk}</span>
                              <span className="font-semibold">{String(entry[kk] ?? '')}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/70 pt-1 border-t border-border/40">
                {d.sentiment && (
                  <span>
                    Duygu: <span className="font-semibold capitalize">{d.sentiment}</span>
                  </span>
                )}
                {d.analysis?.time_horizon && (
                  <span>
                    Vade: <span className="font-semibold">{d.analysis.time_horizon}</span>
                  </span>
                )}
                {d.confidence != null && (
                  <span>
                    Güven: <span className="font-semibold">%{Math.round(d.confidence * 100)}</span>
                  </span>
                )}
                {d.ai_model_used && (
                  <span>
                    Model: <span className="font-semibold">{d.ai_model_used}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground/80 space-y-1">
              <div className="flex justify-between"><span>Bildirim No</span><span className="font-semibold text-foreground/80">{d.disclosure_index}</span></div>
              {d.mkk_member_id && <div className="flex justify-between"><span>Üye</span><span className="font-semibold text-foreground/80">{d.mkk_member_id}</span></div>}
              {d.analysis?.analyzed_at && <div className="flex justify-between"><span>Analiz Zamanı</span><span className="font-semibold text-foreground/80">{formatDateTime(d.analysis.analyzed_at)}</span></div>}
              {d.analysis?.source && <div className="flex justify-between"><span>Kaynak</span><span className="font-semibold text-foreground/80">{d.analysis.source}</span></div>}
            </div>
          </div>
        ) : (
          /* No analysis yet — K11 trigger */
          <div className="rounded-2xl border border-border/60 bg-card p-8 flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Bu bildirim için henüz AI analizi yok</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Birkaç saniyede özet, etki analizi ve anahtar rakamları üretelim.
              </p>
            </div>
            <button
              onClick={() => analyze.mutate()}
              disabled={analyze.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {analyze.isPending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              {analyze.isPending ? 'Analiz oluşturuluyor...' : 'AI Analiz Oluştur'}
            </button>
            {analyze.isError && (
              <p className="text-xs text-destructive">{(analyze.error as Error | null)?.message || 'Analiz başarısız oldu.'}</p>
            )}
            {analyze.isSuccess && (
              <p className="text-xs text-emerald-600">Analiz hazır! Sayfa yenileniyor...</p>
            )}
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}
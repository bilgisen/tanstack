import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { AlertCircle, ArrowLeft, Clock, ExternalLink, FileText, Loader2, RefreshCw, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { logKAPClick, useKAPAnalyze, useKAPDetail, useKAPDetailBody } from '../lib/useKAPData'
import { useCompTrends } from '../lib/useCompData'

export const Route = createFileRoute('/kap-bildirimleri/$disclosureId')({
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

/** HTML metni düz metne çevirir (denetim görüşü güvenli gösterim için). */
function htmlToText(raw: string | null | undefined): string {
  if (!raw) return ''
  const div = document.createElement('div')
  div.innerHTML = raw
  return (div.textContent || '').replace(/\s+/g, ' ').trim()
}

const AUDIT_TYPE_LABELS: Record<string, string> = {
  FT: 'Tam Denetim',
  LT: 'Sınırlı Denetim',
  NO: 'Denetim Yok',
}

const OPINION_TYPE_LABELS: Record<string, string> = {
  OC: 'Olumlu',
  CO: 'Şartlı Olumlu',
  NC: 'Olumsuz',
  OO: 'Görüş Bildirilemedi',
}

const FT_NITELIK_LABELS: Record<string, string> = {
  C: 'Konsolide',
  NC: 'Konsolide Olmayan',
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

function FinancialTrends({ ticker }: { ticker: string }) {
  const { data, isLoading } = useCompTrends(ticker)

  if (isLoading) return <Skeleton className="h-28 w-full rounded-2xl" />
  if (!data || !data.trends) return null

  const tr = data.trends
  const netMargin = tr.net_margin?.values || []
  const ebitdaMargin = tr.ebitda_margin?.values || []
  const roe = tr.roe?.values || []

  // Get periods (last 4 quarters)
  const periods = netMargin.map(v => v.period).slice(0, 4)
  if (periods.length === 0) return null

  const fmtPercent = (v: number | null | undefined) => {
    if (v == null) return '—'
    return `${(v * 100).toFixed(2)}%`
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <TrendingUp size={15} className="text-primary" />
        Geçmiş Çeyrek Finansal Trendleri
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground font-medium">
              <th className="py-2 pr-4">Çeyrek</th>
              <th className="py-2 px-4 text-right">Net Kâr Marjı</th>
              <th className="py-2 px-4 text-right">FAVÖK Marjı</th>
              <th className="py-2 pl-4 text-right">Özkaynak Kârlılığı (ROE)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 font-mono">
            {periods.map(p => {
              const nm = netMargin.find(v => v.period === p)?.value
              const em = ebitdaMargin.find(v => v.period === p)?.value
              const r = roe.find(v => v.period === p)?.value
              return (
                <tr key={p} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-foreground/80">{p}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-500 font-medium">{fmtPercent(nm)}</td>
                  <td className="py-2.5 px-4 text-right text-primary font-medium">{fmtPercent(em)}</td>
                  <td className="py-2.5 pl-4 text-right text-foreground/80">{fmtPercent(r)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BildirimDetayPage() {
  const { disclosureId } = Route.useParams()
  const { data: d, isLoading, isError } = useKAPDetail(disclosureId)
  const analyze = useKAPAnalyze(disclosureId)
  const body = useKAPDetailBody(disclosureId)

  useEffect(() => {
    logKAPClick(disclosureId, 'detail')
  }, [disclosureId])

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
          <Link to="/kap-bildirimleri" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
            <ArrowLeft size={12} className="inline mr-1" />Bildirimlere Dön
          </Link>
        </div>
      </PublicPageLayout>
    )
  }

  const hasAnalysis = d.importance_score != null
  const issue = d.is_late === 1
  const changed = d.is_changed === 1
  const isFinancial = d.analysis?.category === 'FINANCIAL_REPORT' || d.disclosure_category === 'FR' || d.disclosure_category === 'FINANCIAL_REPORT'

  return (
    <PublicPageLayout context={`bildirim:${disclosureId}`} placeholder="Bu bildirim hakkında bir soru sorun...">
      <div className="space-y-4 pb-8 animate-in fade-in duration-400">
        <Link
          to="/kap-bildirimleri"
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
            {/* Attachments directly downloadable from Header */}
            {body.data?.attachments && body.data.attachments.map(att => (
              <a
                key={att.obj_id}
                href={`https://www.kap.org.tr/tr/api/file/download/${att.obj_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-2 text-xs font-semibold hover:border-primary/40 transition-colors"
              >
                <FileText size={13} /> {att.file_name || `Ek: ${att.file_extension || ''}`} <ExternalLink size={11} className="opacity-60" />
              </a>
            ))}
          </div>
        </div>

        {/* AI Analysis (Now at the very top!) */}
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

            {/* Financial Trends Integration */}
            {isFinancial && d.tickers?.[0] && (
              <FinancialTrends ticker={d.tickers[0]} />
            )}

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

        {/* Denetim bilgisi */}
        {(() => {
          const audit = d.audit || body.data?.audit
          if (!audit || typeof audit !== 'object') return null
          const member = String(audit.opinionMemberTitle || '')
          const opinion = String(audit.opinion || '')
          const opinionText = htmlToText(opinion)
          return (
            <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck size={15} className="text-primary" />
                Denetim
              </div>
              <div className="flex flex-wrap gap-2">
                {audit.auditType && (
                  <Badge variant="outline">
                    {AUDIT_TYPE_LABELS[String(audit.auditType)] || String(audit.auditType)}
                  </Badge>
                )}
                {audit.opinionType && (
                  <Badge variant="outline">
                    Görüş: {OPINION_TYPE_LABELS[String(audit.opinionType)] || String(audit.opinionType)}
                  </Badge>
                )}
                {audit.ftNiteligi && (
                  <Badge variant="outline">
                    {FT_NITELIK_LABELS[String(audit.ftNiteligi)] || String(audit.ftNiteligi)}
                  </Badge>
                )}
              </div>
              {member && (
                <p className="text-xs text-muted-foreground">
                  Denetim Kuruluşu: <span className="font-semibold text-foreground/80">{member}</span>
                </p>
              )}
              {opinionText && (
                <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                  {opinionText.slice(0, 1200)}
                  {opinionText.length > 1200 && (
                    <a href={d.kap_link} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">
                      …devamı KAP'ta
                    </a>
                  )}
                </p>
              )}
            </div>
          )
        })()}
      </div>
    </PublicPageLayout>
  )
}
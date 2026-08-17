import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Clock, ExternalLink, FileText, Gauge, Loader2, RefreshCw, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { getSessionToken } from '../store/chat'
import { API } from '../lib/apiConfig'
import { logKAPClick, useKAPDetail, useKAPDetailBody } from '../lib/useKAPData'
import { useCompTrends } from '../lib/useCompData'

export const Route = createFileRoute('/kap-bildirimleri/$disclosureId')({
  component: BildirimDetayPage,
})

const KAP_BASE = API.hono
const ANALYZE_MODEL_ID = 'gemini-2.5-flash'
const EST_INPUT_TOKENS = 2000
const EST_OUTPUT_TOKENS = 800

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
  const body = useKAPDetailBody(disclosureId)
  const queryClient = useQueryClient()

  const [liveResult, setLiveResult] = useState<{
    summary_tr?: string | null
    impact_analysis?: string | null
    key_numbers?: Array<string | Record<string, unknown>> | null
    sentiment?: string | null
    confidence?: number | null
    ai_model_used?: string | null
  } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)

  useEffect(() => {
    logKAPClick(disclosureId, 'detail')
  }, [disclosureId])

  const generate = useCallback(async () => {
    if (generating) return
    setGenerating(true)
    setGenError(null)
    const requestId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
    try {
      const sessionToken = await getSessionToken()
      if (!sessionToken) {
        setGenError('Analiz oluşturmak için giriş yapmalısınız.')
        setGenerating(false)
        return
      }

      // 1. Token reservation (pre-check)
      const preCheckRes = await fetch('/api/ai/pre-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: ANALYZE_MODEL_ID, estimatedInputTokens: EST_INPUT_TOKENS, estimatedOutputTokens: EST_OUTPUT_TOKENS }),
      })
      const preCheck = preCheckRes.ok ? await preCheckRes.json() : { ok: false, error: 'UNKNOWN' }
      if (!preCheck.ok) {
        let msg = 'Analiz oluşturulamadı. Lütfen tekrar deneyin.'
        if (preCheck.error === 'MODEL_NOT_ALLOWED') {
          msg = 'Bu özellik şu an kullanılamamaktadır. Abonelik paketinizi [Profil ve Abonelik Paneli](/profil) sayfasında inceleyebilirsiniz.'
        } else if (preCheck.error === 'INSUFFICIENT_JT' || preCheck.error === 'INSUFFICIENT_HT') {
          const available = preCheck.availableJT || preCheck.availableHT || 0
          msg = `Yetersiz Jet Token bakiyesi! Mevcut bakiyeniz: ${available.toLocaleString()} Jet Token. [Profil ve Abonelik Paneli](/profil) üzerinden ek kredi alabilirsiniz.`
        } else if (preCheck.error === 'DAILY_LIMIT') {
          msg = 'Günlük kullanım limitinize ulaştınız. Sınırsız kullanım için [Profil ve Abonelik Paneli](/profil) sayfasından paketinizi yükseltin.'
        } else if (preCheck.error === 'USER_NOT_FOUND') {
          msg = 'Kullanıcı bilgileriniz bulunamadı. Sayfayı yenileyip tekrar deneyin.'
        }
        setGenError(msg)
        setGenerating(false)
        return
      }
      const reservedCost = preCheck.estimatedCost || 0
      setEstimatedCost(reservedCost)

      // 2. Generate analysis (hono orchestrator → kapi-ai)
      const res = await fetch(`${KAP_BASE}/api/notifications/detail/${encodeURIComponent(disclosureId)}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: '{}',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        setGenError(j?.error || `Analiz isteği başarısız (${res.status})`)
        setGenerating(false)
        return
      }
      const data = (await res.json()) as {
        ok?: boolean
        model?: string
        summary_tr?: string
        impact_analysis?: string
        key_numbers?: Array<string | Record<string, unknown>>
        sentiment?: string
        confidence?: number
      }
      setLiveResult({
        summary_tr: data.summary_tr ?? null,
        impact_analysis: data.impact_analysis ?? null,
        key_numbers: data.key_numbers ?? null,
        sentiment: data.sentiment ?? null,
        confidence: data.confidence ?? null,
        ai_model_used: data.model ?? null,
      })

      // 3. Charge tokens (fire-and-forget — idempotent by requestId)
      const narrative = data.summary_tr || ''
      fetch('/api/ai/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: ANALYZE_MODEL_ID,
          inputTokens: EST_INPUT_TOKENS,
          outputTokens: Math.max(500, Math.ceil(narrative.length / 4)),
          reservedCost,
          requestId,
          featureType: 'kap_analysis',
        }),
      }).catch(() => {})
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ht-balance-updated'))

      queryClient.invalidateQueries({ queryKey: ['kap', 'detail', disclosureId] })
      queryClient.invalidateQueries({ queryKey: ['kap', 'feed'] })
    } catch (e) {
      console.error('KAP analysis generation failed:', e)
      setGenError('Analiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setGenerating(false)
    }
  }, [disclosureId, generating, queryClient])

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

  const hasAnalysis = !!(d.summary_tr || liveResult?.summary_tr)
  const issue = d.is_late === 1
  const changed = d.is_changed === 1
  const isFinancial = d.analysis?.category === 'FINANCIAL_REPORT' || d.disclosure_category === 'FR' || d.disclosure_category === 'FINANCIAL_REPORT'

  const display = liveResult
    ? {
        ...d,
        summary_tr: liveResult.summary_tr ?? d.summary_tr,
        impact_analysis: liveResult.impact_analysis ?? d.impact_analysis,
        key_numbers: liveResult.key_numbers ?? d.key_numbers,
        sentiment: liveResult.sentiment ?? d.sentiment,
        confidence: liveResult.confidence ?? d.confidence,
        ai_model_used: liveResult.ai_model_used ?? d.ai_model_used,
      }
    : d

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
            {d.importance_score != null && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${scoreColor(d.importance_score)}`}>
                Önem: {d.importance_score}
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-snug">{d.title}</h1>
          {d.subject && <p className="text-sm text-muted-foreground">{d.subject}</p>}

          {d.summary && (
            <p className="rounded-xl border border-border/40 bg-muted/30 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85">
              {d.summary}
            </p>
          )}

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

        {/* AI Analysis */}
        {hasAnalysis ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles size={15} className="text-primary" />
                  AI Analizi
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${scoreColor(display.importance_score)}`}>
                  Önem: {display.importance_score ?? '—'}
                </span>
              </div>

              {display.summary_tr && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Özet</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{display.summary_tr}</p>
                </div>
              )}

              {display.impact_analysis && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Etki Analizi</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{display.impact_analysis}</p>
                </div>
              )}

              {display.key_numbers && Array.isArray(display.key_numbers) && display.key_numbers.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Anahtar Rakamlar</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {display.key_numbers.map((k, i) => {
                      if (typeof k === 'string') {
                        return (
                          <div key={i} className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs font-semibold text-foreground/90">
                            {k}
                          </div>
                        )
                      }
                      const keys = Object.keys(k)
                      return (
                        <div key={i} className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
                          {keys.map(kk => (
                            <div key={kk} className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground">{kk}</span>
                              <span className="font-semibold">{String(k[kk] ?? '')}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/70 pt-1 border-t border-border/40">
                {display.sentiment && (
                  <span>
                    Duygu: <span className="font-semibold capitalize">{display.sentiment}</span>
                  </span>
                )}
                {d.analysis?.time_horizon && (
                  <span>
                    Vade: <span className="font-semibold">{d.analysis.time_horizon}</span>
                  </span>
                )}
                {display.confidence != null && (
                  <span>
                    Güven: <span className="font-semibold">%{Math.round(display.confidence * 100)}</span>
                  </span>
                )}
                {display.ai_model_used && (
                  <span>
                    Model: <span className="font-semibold">{display.ai_model_used}</span>
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
          /* No analysis yet — compact trigger (AiTechnicalReport-style) */
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles size={15} className="text-primary" />
                AI Analizi
              </div>
              {estimatedCost != null && !generating && (
                <span className="inline-flex items-center gap-1 rounded-full border border-muted/20 bg-muted/10 px-2 py-1 text-[11px] text-foreground">
                  <Gauge size={11} className="text-primary" /> ~{estimatedCost.toLocaleString()} JT
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Bu bildirim için otomatik AI analizi oluşturulmadı. Özet, etki analizi ve anahtar rakamları tek tıkla üretelim. Analiz oluşturmak belirli bir Jet Token tutarı harcar.
            </p>

            {genError && !generating && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {genError}
              </div>
            )}

            <button
              onClick={generate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {generating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              {generating ? 'Analiz oluşturuluyor...' : 'AI Analiz Oluştur'}
            </button>
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
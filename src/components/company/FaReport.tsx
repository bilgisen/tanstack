import { useCompAnalysis, useCompSwot, useCompFundamentalReport, type AnalysisScore } from '../../lib/useCompData'
import { ScoreGauge } from '../../constants/companyShared'
import { getRatioLabel } from '../../constants/ratios'
import { TrendingUp, Shield, Target, Lightbulb, AlertTriangle, Sparkles, FileText } from 'lucide-react'

interface FaReportProps {
  ticker: string
}

type SwotEntry = { item: string } | string

function swotText(entry: SwotEntry): string {
  return typeof entry === 'string' ? entry : entry.item
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function FaReport({ ticker }: FaReportProps) {
  const { data: analysis, isLoading: analysisLoading } = useCompAnalysis(ticker)
  const { data: swot, isLoading: swotLoading } = useCompSwot(ticker)
  const { data: report, isLoading: reportLoading } = useCompFundamentalReport(ticker)

  const loading = analysisLoading || swotLoading || reportLoading

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-32 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!analysis && !report && !swot) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        Temel analiz verisi bulunamadı.
      </div>
    )
  }

  const scoreData: AnalysisScore | undefined = analysis?.score || report?.financial_health?.score
  const overall = report?.financial_health?.overall
  const execSummary = report?.executive_summary
  const keyMetrics = analysis?.key_metrics
  const ratios = report?.ratios

  const overallColors: Record<string, string> = {
    iyi: 'text-emerald-500',
    orta: 'text-yellow-500',
    zayıf: 'text-red-500',
  }

  return (
    <div className="space-y-5">

      {/* Executive Summary */}
      {(execSummary || overall || scoreData) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Özet</h3>
          </div>

          <div className="flex items-start gap-4">
            {scoreData?.genel != null && (
              <ScoreGauge score={Math.round(scoreData.genel)} size={72} />
            )}
            <div className="space-y-2">
              {execSummary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{execSummary}</p>
              )}
              {overall && (
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${overallColors[overall] || 'text-muted-foreground'}`}>
                  <Shield size={14} />
                  Finansal Sağlık: {overall.toUpperCase()}
                </span>
              )}
              {scoreData && (
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {scoreData.karlilik != null && <span>Karlılık: {scoreData.karlilik}</span>}
                  {scoreData.finansal != null && <span>Finansal: {scoreData.finansal}</span>}
                  {scoreData.degerleme != null && <span>Değerleme: {scoreData.degerleme}</span>}
                  {scoreData.verimlilik != null && <span>Verimlilik: {scoreData.verimlilik}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {keyMetrics && Object.keys(keyMetrics).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Anahtar Metrikler</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(keyMetrics).map(([code, m]) => (
              <div key={code} className="bg-muted/10 border border-border/20 rounded-xl px-4 py-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.name}</div>
                <div className="text-base font-bold font-mono text-foreground mt-0.5">
                  {m.value != null ? fmt(m.value) : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SWOT Analysis */}
      {swot && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-amber-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">SWOT Analizi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {swot.strengths && swot.strengths.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Güçlü Yönler</span>
                </div>
                <ul className="space-y-1">
                  {swot.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {swotText(s)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {swot.weaknesses && swot.weaknesses.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Zayıf Yönler</span>
                </div>
                <ul className="space-y-1">
                  {swot.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5">•</span>
                      {swotText(w)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {swot.opportunities && swot.opportunities.length > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} className="text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Fırsatlar</span>
                </div>
                <ul className="space-y-1">
                  {swot.opportunities.map((o, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {swotText(o)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {swot.threats && swot.threats.length > 0 && (
              <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Tehditler</span>
                </div>
                <ul className="space-y-1">
                  {swot.threats.map((t, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {swotText(t)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ratios from report */}
      {ratios && Object.keys(ratios).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Tüm Rasyolar</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(ratios).map(([code, val]) => (
              <div key={code} className="bg-muted/10 border border-border/20 rounded-lg px-2.5 py-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{getRatioLabel(code)}</div>
                <div className="text-xs font-bold font-mono text-foreground mt-0.5">{val != null ? fmt(val) : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {report?.disclaimer && (
        <div className="text-[10px] text-muted-foreground/40 italic text-center pt-2 border-t border-border/20">
          {report.disclaimer}
        </div>
      )}
    </div>
  )
}

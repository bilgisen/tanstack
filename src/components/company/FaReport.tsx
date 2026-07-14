import { useCompAnalysis, useCompSwot, useCompFundamentalReport } from '../../lib/useCompData'
import { ScoreGauge } from '../../constants/companyShared'
import { TrendingUp, Shield, DollarSign, Target, Lightbulb, AlertTriangle, Sparkles, FileText } from 'lucide-react'

interface FaReportProps {
  ticker: string
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function FaReport({ ticker }: FaReportProps) {
  const { data: analysisRaw, isLoading: analysisLoading } = useCompAnalysis(ticker)
  const { data: swotRaw, isLoading: swotLoading } = useCompSwot(ticker)
  const { data: reportRaw, isLoading: reportLoading } = useCompFundamentalReport(ticker)
  const analysis = (analysisRaw as any) || null
  const swot = (swotRaw as any) || null
  const report = (reportRaw as any) || null

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

  const scoreData = analysis?.score || report?.financial_health?.score || null
  const overall = report?.financial_health?.overall || null
  const execSummary = report?.executive_summary || null
  const keyMetrics = analysis?.key_metrics || null
  const swotData = swot || null

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
            {Object.entries(keyMetrics).map(([code, m]: [string, any]) => (
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
      {swotData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-amber-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">SWOT Analizi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {swotData.strengths && swotData.strengths.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Güçlü Yönler</span>
                </div>
                <ul className="space-y-1">
                  {swotData.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {swotData.weaknesses && swotData.weaknesses.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Zayıf Yönler</span>
                </div>
                <ul className="space-y-1">
                  {swotData.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {swotData.opportunities && swotData.opportunities.length > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} className="text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Fırsatlar</span>
                </div>
                <ul className="space-y-1">
                  {swotData.opportunities.map((o: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {swotData.threats && swotData.threats.length > 0 && (
              <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Tehditler</span>
                </div>
                <ul className="space-y-1">
                  {swotData.threats.map((t: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ratios from report */}
      {report?.ratios && Object.keys(report.ratios).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Tüm Rasyolar</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(report.ratios).map(([code, val]: [string, any]) => (
              <div key={code} className="bg-muted/10 border border-border/20 rounded-lg px-2.5 py-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{code}</div>
                <div className="text-xs font-bold font-mono text-foreground mt-0.5">{fmt(val)}</div>
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

import { useCompAnalysis, useCompFundamentalReport, type AnalysisScore } from '../../lib/useCompData'
import { ScoreGauge } from '../../constants/companyShared'
import { getRatioLabel } from '../../constants/ratios'
import { Shield, Target, Sparkles, FileText } from 'lucide-react'

interface FaReportProps {
  ticker: string
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function FaReport({ ticker }: FaReportProps) {
  const { data: analysis, isLoading: analysisLoading } = useCompAnalysis(ticker)
  const { data: report, isLoading: reportLoading } = useCompFundamentalReport(ticker)

  const loading = analysisLoading || reportLoading

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-32 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!analysis && !report) {
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

      {/* Öne Çıkanlar */}
      {analysis?.key_insights && analysis.key_insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Öne Çıkanlar</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.key_insights.map((insight, i) => {
              const catColor: Record<string, string> = {
                strength: 'border-l-emerald-500 bg-emerald-500/5',
                weakness: 'border-l-red-500 bg-red-500/5',
                positive_trend: 'border-l-blue-500 bg-blue-500/5',
                negative_trend: 'border-l-orange-500 bg-orange-500/5',
                data_quality: 'border-l-gray-500 bg-gray-500/5',
              }
              const barColor = catColor[insight.category] || 'border-l-muted bg-muted/5'
              return (
                <div key={i} className={`border-l-2 pl-3 py-1.5 ${barColor}`}>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {insight.category === 'strength' ? 'Güçlü Yön' :
                     insight.category === 'weakness' ? 'Zayıf Yön' :
                     insight.category === 'positive_trend' ? 'Olumlu Trend' :
                     insight.category === 'negative_trend' ? 'Olumsuz Trend' : 'Veri'}
                  </span>
                  <p className="text-xs text-foreground mt-0.5">{insight.insight}</p>
                </div>
              )
            })}
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

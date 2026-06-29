/**
 * AI Analiz Özeti Bileşeni
 * Member: 1 paragraf özet
 * Subscriber: Detaylı rapor
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Lock,
  Download,
  Share2
} from 'lucide-react';

interface AnalysisSummaryProps {
  summary?: string;
  keyStrengths?: string[];
  keyConcerns?: string[];
  detailedReport?: {
    executiveSummary: string;
    financialPosition: string;
    profitabilityAnalysis: string;
    balanceSheetAnalysis: string;
    sectorComparison: string;
    catalysts: string[];
    risks: string[];
    conclusion: string;
    disclaimer: string;
  };
  tier: 'anonymous' | 'member' | 'subscriber';
  ticker: string;
  companyName: string;
  onUpgrade?: () => void;
}

export function AnalysisSummary({
  summary,
  keyStrengths,
  keyConcerns,
  detailedReport,
  tier,
  ticker,
  companyName,
  onUpgrade,
}: AnalysisSummaryProps) {
  // Anonymous: Show CTA
  if (tier === 'anonymous') {
    return (
      <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI Analiz Özeti</h3>
        </div>
        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-gray-600 text-center mb-4">
            <strong>{companyName}</strong> için profesyonel AI analizi
            <br />
            <span className="text-sm">Kârlılık, finansal sağlık ve sektör karşılaştırması</span>
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Üye Ol - Analizi Gör
            </button>
          )}
        </div>
      </div>
    );
  }

  // Member: Show 1 paragraph summary
  if (tier === 'member' && summary) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Analiz Özeti</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            AI Generated
          </span>
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">
          {summary}
        </p>

        {keyStrengths && keyStrengths.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium mb-1">
              <TrendingUp className="h-4 w-4" />
              Güçlü Yönler
            </div>
            <div className="flex flex-wrap gap-2">
              {keyStrengths.map((s, i) => (
                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {keyConcerns && keyConcerns.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 text-amber-600 text-sm font-medium mb-1">
              <AlertCircle className="h-4 w-4" />
              Dikkat Edilmesi Gerekenler
            </div>
            <div className="flex flex-wrap gap-2">
              {keyConcerns.map((c, i) => (
                <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade to Subscriber */}
        <div className="pt-4 border-t mt-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div>
              <p className="font-medium text-gray-900">Detaylı Rapor İster misiniz?</p>
              <p className="text-sm text-gray-600">SWOT analizi + CEO-level rapor</p>
            </div>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Abone Ol
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Subscriber: Show detailed report
  if (tier === 'subscriber' && detailedReport) {
    return (
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <h3 className="text-xl font-bold">Detaylı Analiz Raporu</h3>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-white/80 mt-1">
            {ticker} - {companyName}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Executive Summary */}
          <Section title="📋 Yönetici Özeti" content={detailedReport.executiveSummary} />

          {/* Financial Position */}
          <Section title="📊 Finansal Durum" content={detailedReport.financialPosition} />

          {/* Profitability */}
          <Section title="💰 Kârlılık Analizi" content={detailedReport.profitabilityAnalysis} />

          {/* Balance Sheet */}
          <Section title="📑 Bilânço Analizi" content={detailedReport.balanceSheetAnalysis} />

          {/* Sector Comparison */}
          <Section title="📈 Sektör Karşılaştırması" content={detailedReport.sectorComparison} />

          {/* Catalysts */}
          {detailedReport.catalysts.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Katalizörler
              </h4>
              <ul className="space-y-1">
                {detailedReport.catalysts.map((c, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {detailedReport.risks.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Riskler
              </h4>
              <ul className="space-y-1">
                {detailedReport.risks.map((r, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conclusion */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-2">Sonuç</h4>
            <p className="text-gray-700">{detailedReport.conclusion}</p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 italic">
            {detailedReport.disclaimer}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  );
}

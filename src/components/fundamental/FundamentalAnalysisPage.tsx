/**
 * Temel Analiz Sayfası - Ana Bileşen
 * Combines all cards into a complete fundamental analysis view
 */

import * as React from 'react';
import { ScoreCard } from './ScoreCard';
import { RatioCardsGrid } from './RatioCard';
import { SWOTCard, SWOTBadge } from './SWOTCard';
import { AnalysisSummary } from './AnalysisSummary';
import { SectorPositionCard } from './SectorPositionCard';

// Types
export type UserTier = 'anonymous' | 'member' | 'subscriber';

export interface FundamentalAnalysisData {
  tier: UserTier;
  ticker: string;
  company_name: string;
  sector: string;
  period_key: string;
  computed_at: string;
  data_quality: string;
  cards: Array<{
    type: string;
    data: Record<string, any>;
  }>;
  summary?: {
    summary: string;
    key_strengths: string[];
    key_concerns: string[];
  };
  detailed_report?: {
    executive_summary: string;
    financial_position: string;
    profitability_analysis: string;
    balance_sheet_analysis: string;
    sector_comparison: string;
    catalysts: string[];
    risks: string[];
    conclusion: string;
    disclaimer: string;
  };
}

interface FundamentalAnalysisPageProps {
  data: FundamentalAnalysisData;
  onUpgrade?: (targetTier: UserTier) => void;
}

export function FundamentalAnalysisPage({ data, onUpgrade }: FundamentalAnalysisPageProps) {
  const { tier, ticker, company_name, sector, cards, summary, detailed_report } = data;

  // Extract card data
  const scoreCardData = cards.find(c => c.type === 'score_card')?.data;
  const ratioCardsData = cards.filter(c => c.type === 'ratio_comparison').map(c => c.data);
  const sectorPositionData = cards.find(c => c.type === 'sector_position')?.data;
  const swotData = cards.find(c => c.type === 'swot')?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Temel Analiz</h1>
          <p className="text-sm text-gray-500">
            {company_name} ({ticker}) • {sector} • {data.period_key}
          </p>
        </div>
        <SWOTBadge tier={tier} onUpgrade={() => onUpgrade?.('subscriber')} />
      </div>

      {/* Top Row: Score + Sector Position */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scoreCardData && (
          <ScoreCard
            scoreSektor={scoreCardData.score_sektor}
            scoreGenel={scoreCardData.score_genel}
            scoreKarlilik={scoreCardData.score_karlilik}
            scoreFinansal={scoreCardData.score_finansal}
            scoreVerimlilik={scoreCardData.score_verimlilik}
            reliability={scoreCardData.reliability}
            percentileSector={scoreCardData.percentile_sector}
            rankSector={scoreCardData.rank_sector}
            totalPeers={scoreCardData.total_peers}
            tier={tier}
            onUpgrade={() => onUpgrade?.('member')}
          />
        )}

        {sectorPositionData && (
          <SectorPositionCard
            sectorName={sectorPositionData.sector_name}
            totalCompanies={sectorPositionData.total_companies}
            rank={sectorPositionData.rank}
            percentile={sectorPositionData.percentile}
            aboveMedianRatios={sectorPositionData.above_median_ratios || []}
            belowMedianRatios={sectorPositionData.below_median_ratios || []}
            tier={tier}
            onUpgrade={() => onUpgrade?.('member')}
          />
        )}
      </div>

      {/* Ratio Cards */}
      {ratioCardsData.length > 0 && (
        <RatioCardsGrid
          ratios={ratioCardsData}
          tier={tier}
          onUpgrade={() => onUpgrade?.('member')}
        />
      )}

      {/* AI Analysis Summary */}
      <AnalysisSummary
        summary={summary?.summary}
        keyStrengths={summary?.key_strengths}
        keyConcerns={summary?.key_concerns}
        detailedReport={detailed_report}
        tier={tier}
        ticker={ticker}
        companyName={company_name}
        onUpgrade={() => onUpgrade?.(tier === 'anonymous' ? 'member' : 'subscriber')}
      />

      {/* SWOT Card */}
      {swotData && (
        <SWOTCard
          strengths={swotData.strengths || []}
          weaknesses={swotData.weaknesses || []}
          opportunities={swotData.opportunities || []}
          threats={swotData.threats || []}
          overallAssessment={swotData.overall_assessment}
          tier={tier}
          onUpgrade={() => onUpgrade?.('subscriber')}
        />
      )}
    </div>
  );
}

/**
 * Hook for fetching fundamental analysis data
 */
export function useFundamentalAnalysis(ticker: string, tier: UserTier) {
  const [data, setData] = React.useState<FundamentalAnalysisData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const honoUrl = import.meta.env.VITE_HONO_URL || 'https://hono.ortakcalisma.workers.dev';
        
        // Get token based on tier (this would come from your auth system)
        const token = tier === 'subscriber' ? 'subscriber_token' :
                      tier === 'member' ? 'member_token' : '';

        const response = await fetch(`${honoUrl}/api/ai/analysis/${ticker}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch analysis: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, tier]);

  return { data, loading, error };
}

/**
 * Compact version for embedding in other pages
 */
export function FundamentalAnalysisWidget({ 
  ticker, 
  tier = 'anonymous',
  onUpgrade 
}: { 
  ticker: string;
  tier?: UserTier;
  onUpgrade?: () => void;
}) {
  const { data, loading, error } = useFundamentalAnalysis(ticker, tier);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-red-600">Analiz yüklenemedi: {error}</p>
      </div>
    );
  }

  const scoreCardData = data.cards.find(c => c.type === 'score_card')?.data;
  const ratioCardsData = data.cards.filter(c => c.type === 'ratio_comparison').slice(0, 3).map(c => c.data);

  return (
    <div className="space-y-4">
      {/* Mini Score Card */}
      {scoreCardData && (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
              <circle
                cx="32" cy="32" r="28"
                stroke={scoreCardData.score_sektor >= 70 ? '#22c55e' : scoreCardData.score_sektor >= 50 ? '#eab308' : '#ef4444'}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(scoreCardData.score_sektor / 100) * 176} 176`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {scoreCardData.score_sektor?.toFixed(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Temel Analiz Puanı</p>
            <p className="text-sm text-gray-500">
              Sektör: %{scoreCardData.percentile_sector} | Sıra: {scoreCardData.rank_sector}
            </p>
          </div>
        </div>
      )}

      {/* Mini Ratio Grid */}
      <div className="grid grid-cols-3 gap-3">
        {ratioCardsData.map((ratio, i) => (
          <div key={i} className="p-3 bg-white rounded-lg border text-center">
            <p className="text-xs text-gray-500">{ratio.ratio_name}</p>
            <p className="font-bold text-gray-900">
              {ratio.company_value?.toFixed(2) || '-'}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      {tier === 'anonymous' && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Detaylı Analiz İçin Üye Ol
        </button>
      )}
    </div>
  );
}

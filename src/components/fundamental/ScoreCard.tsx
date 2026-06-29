/**
 * Temel Analiz Puan Kartı
 * Shows company's fundamental analysis score with pillar breakdown
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  scoreSektor: number | null;
  scoreGenel: number | null;
  scoreKarlilik: number | null;
  scoreFinansal: number | null;
  scoreVerimlilik: number | null;
  reliability: string | null;
  percentileSector: number | null;
  rankSector: number | null;
  totalPeers: number | null;
  tier: 'anonymous' | 'member' | 'subscriber';
  onUpgrade?: () => void;
}

export function ScoreCard({
  scoreSektor,
  scoreGenel,
  scoreKarlilik,
  scoreFinansal,
  scoreVerimlilik,
  reliability,
  percentileSector,
  rankSector,
  totalPeers,
  tier,
  onUpgrade,
}: ScoreCardProps) {
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-gray-200';
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const mainScore = scoreSektor ?? 0;
  const isLocked = tier === 'anonymous';

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Temel Analiz Puanı</h3>
        {reliability && (
          <span className={cn(
            "px-2 py-1 text-xs rounded-full",
            reliability === 'HIGH' ? 'bg-green-100 text-green-700' :
            reliability === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          )}>
            {reliability}
          </span>
        )}
      </div>

      {/* Main Score Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={isLocked ? '#9ca3af' : mainScore >= 70 ? '#22c55e' : mainScore >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(mainScore / 100) * 440} 440`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", getScoreColor(mainScore))}>
              {isLocked ? '?' : mainScore.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
        </div>
      </div>

      {/* Pillar Scores */}
      <div className="space-y-3">
        <PillarBar label="Kârlılık" score={scoreKarlilik} isLocked={isLocked} />
        <PillarBar label="Finansal Sağlık" score={scoreFinansal} isLocked={isLocked} />
        <PillarBar label="Verimlilik" score={scoreVerimlilik} isLocked={isLocked} />
      </div>

      {/* Sector Position */}
      {tier !== 'anonymous' && rankSector && totalPeers && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sektör Sırası</span>
            <span className="font-medium">{rankSector} / {totalPeers}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Percentil</span>
            <span className="font-medium">%{percentileSector}</span>
          </div>
        </div>
      )}

      {/* Upgrade CTA for Anonymous */}
      {tier === 'anonymous' && onUpgrade && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onUpgrade}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Detaylı Analiz İçin Üye Ol
          </button>
        </div>
      )}
    </div>
  );
}

function PillarBar({ label, score, isLocked }: { label: string; score: number | null; isLocked: boolean }) {
  const percentage = score ?? 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={cn(
          "font-medium",
          isLocked ? 'text-gray-400' :
          score !== null && score >= 70 ? 'text-green-600' :
          score !== null && score >= 50 ? 'text-yellow-600' :
          'text-red-600'
        )}>
          {isLocked ? '?' : score?.toFixed(0) ?? '-'}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isLocked ? 'bg-gray-300' :
            score !== null && score >= 70 ? 'bg-green-500' :
            score !== null && score >= 50 ? 'bg-yellow-500' :
            'bg-red-500'
          )}
          style={{ width: `${isLocked ? 50 : percentage}%` }}
        />
      </div>
    </div>
  );
}

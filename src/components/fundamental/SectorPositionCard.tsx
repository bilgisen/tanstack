/**
 * Sektör Pozisyon Kartı
 * Shows company's position within its sector
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectorPositionCardProps {
  sectorName: string;
  totalCompanies: number;
  rank: number;
  percentile: number;
  aboveMedianRatios: string[];
  belowMedianRatios: string[];
  tier: 'anonymous' | 'member' | 'subscriber';
  onUpgrade?: () => void;
}

export function SectorPositionCard({
  sectorName,
  totalCompanies,
  rank,
  percentile,
  aboveMedianRatios,
  belowMedianRatios,
  tier,
  onUpgrade,
}: SectorPositionCardProps) {
  const isLocked = tier === 'anonymous';

  if (isLocked) {
    return (
      <div className="rounded-xl border bg-gray-50 p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-400">Sektör İçi Pozisyon</h3>
          <span className="text-xs text-gray-400">🔒 Üye Gerekli</span>
        </div>
        <div className="filter blur-sm select-none">
          <div className="h-20 bg-gray-200 rounded-lg mb-4" />
          <div className="flex gap-4">
            <div className="flex-1 h-8 bg-gray-200 rounded" />
            <div className="flex-1 h-8 bg-gray-200 rounded" />
          </div>
        </div>
        {onUpgrade && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              Üye Ol
            </button>
          </div>
        )}
      </div>
    );
  }

  const getPositionLabel = () => {
    if (percentile >= 90) return { label: 'Lider', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentile >= 70) return { label: 'Üst Çeyrek', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentile >= 50) return { label: 'Ortalama Üstü', color: 'text-cyan-600', bg: 'bg-cyan-100' };
    if (percentile >= 30) return { label: 'Ortalama Altı', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Geliştirilmeli', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const position = getPositionLabel();

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sektör İçi Pozisyon</h3>
        <span className={cn('px-2 py-1 text-xs rounded-full font-medium', position.bg, position.color)}>
          {position.label}
        </span>
      </div>

      {/* Sector Name */}
      <p className="text-sm text-gray-500 mb-4">{sectorName}</p>

      {/* Position Visualization */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{rank}</div>
            <div className="text-xs text-gray-500">Sıra</div>
          </div>
          <div className="flex-1 mx-4">
            <div className="h-3 bg-gray-100 rounded-full relative">
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                style={{ width: `${percentile}%` }}
              />
              <div
                className="absolute top-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full -translate-x-1/2 -translate-y-0.5"
                style={{ left: `${percentile}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{totalCompanies}</div>
            <div className="text-xs text-gray-500">Toplam</div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600">
          <span className="font-medium">%{percentile.toFixed(0)}</span> percentil
        </div>
      </div>

      {/* Ratio Performance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Üstünde</span>
            <span className="text-lg font-bold text-green-600">{aboveMedianRatios.length}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {aboveMedianRatios.slice(0, 4).map((r, i) => (
              <span key={i} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                {r}
              </span>
            ))}
            {aboveMedianRatios.length > 4 && (
              <span className="text-xs text-green-600">+{aboveMedianRatios.length - 4}</span>
            )}
          </div>
        </div>

        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Altında</span>
            <span className="text-lg font-bold text-red-600">{belowMedianRatios.length}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {belowMedianRatios.slice(0, 4).map((r, i) => (
              <span key={i} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                {r}
              </span>
            ))}
            {belowMedianRatios.length > 4 && (
              <span className="text-xs text-red-600">+{belowMedianRatios.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

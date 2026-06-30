/**
 * Rasyo Karşılaştırma Kartı
 * Shows individual ratio with sector comparison
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface RatioComparisonCardProps {
  ratioName: string;
  ratioCode: string;
  companyValue: number | null;
  sectorMedian: number | null;
  sectorP25: number | null;
  sectorP75: number | null;
  percentile: number | null;
  interpretation: string | null;
  higherIsBetter: boolean;
  tier: 'anonymous' | 'member' | 'subscriber';
}

const RATIO_DESCRIPTIONS: Record<string, string> = {
  roe: 'Özkaynak Kârlılığı: Şirketin özkaynaklarını ne kadar verimli kullandığını gösterir.',
  roa: 'Aktif Kârlılığı: Toplam varlıkların ne kadar kâr yarattığını ölçer.',
  current_ratio: 'Cari Oran: Kısa vadeli borçları ödeme yeteneğini gösterir.',
  acid_test_ratio: 'Asit Test Oranı: Stoklar çıkarıldıktan sonra likidite durumu.',
  debt_ratio: 'Borçlanma Oranı: Toplam borçların aktiflere oranı.',
  net_debt_to_equity: 'Net Borç / Özkaynak: Finansal kaldıraç düzeyi.',
  gross_margin: 'Brüt Kâr Marjı: Satışların brüt kâra dönüşme oranı.',
  operating_margin: 'Faaliyet Kâr Marjı: Operasyonel verimlilik göstergesi.',
  net_margin: 'Net Kâr Marjı: Son kârlılık performansı.',
  ebitda_margin: 'FAVÖK Marjı: Nakit üretme kabiliyeti.',
  asset_turnover: 'Aktif Devir Hızı: Varlıkların satışa dönüşme hızı.',
};

export function RatioComparisonCard({
  ratioName,
  ratioCode,
  companyValue,
  sectorMedian,
  sectorP25,
  sectorP75,
  percentile,
  interpretation,
  higherIsBetter,
  tier,
}: RatioComparisonCardProps) {
  const formatValue = (val: number | null) => {
    if (val === null) return '-';
    if (ratioCode.includes('margin') || ratioCode === 'roe' || ratioCode === 'roa') {
      return `%${(val * 100).toFixed(1)}`;
    }
    return val.toFixed(2);
  };

  const getDiffPercent = () => {
    if (companyValue === null || sectorMedian === null || sectorMedian === 0) return null;
    return ((companyValue - sectorMedian) / Math.abs(sectorMedian)) * 100;
  };

  const diffPercent = getDiffPercent();
  const isAboveMedian = companyValue !== null && sectorMedian !== null && companyValue > sectorMedian;
  const isGood = higherIsBetter ? isAboveMedian : !isAboveMedian;

  const percentileScore = percentile ?? 50;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{ratioName}</h4>
          <Info className="h-4 w-4 text-gray-400 cursor-help" title={RATIO_DESCRIPTIONS[ratioCode] || 'Finansal oran'} />
        </div>
      </div>

      {/* Company Value */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(companyValue)}
        </div>
        {sectorMedian !== null && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Sektör:</span>
            <span className="text-sm font-medium">{formatValue(sectorMedian)}</span>
            {diffPercent !== null && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {diffPercent > 0 ? '+' : ''}{diffPercent.toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Percentile Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Düşük</span>
          <span>Yüksek</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            style={{ width: `${percentileScore}%` }}
          />
          <div
            className="absolute top-0 w-3 h-3 bg-white border-2 border-blue-500 rounded-full -translate-x-1/2"
            style={{ left: `${percentileScore}%` }}
          />
        </div>
        <div className="text-center text-xs text-gray-500 mt-1">
          %{percentileScore} percentil
        </div>
      </div>

      {/* Interpretation (Member+) */}
      {tier !== 'anonymous' && interpretation && (
        <div className="pt-3 border-t">
          <p className="text-sm text-gray-600">{interpretation}</p>
        </div>
      )}

      {/* P25/P75 Range (Subscriber) */}
      {tier === 'subscriber' && sectorP25 !== null && sectorP75 !== null && (
        <div className="pt-3 border-t mt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>P25: {formatValue(sectorP25)}</span>
            <span>P75: {formatValue(sectorP75)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Rasyo Kartları Grid'i
 */
interface RatioCardsGridProps {
  ratios: Array<RatioComparisonCardProps>;
  tier: 'anonymous' | 'member' | 'subscriber';
  onUpgrade?: () => void;
}

export function RatioCardsGrid({ ratios, tier, onUpgrade }: RatioCardsGridProps) {
  // For anonymous, show only first 3
  const visibleRatios = tier === 'anonymous' ? ratios.slice(0, 3) : ratios;
  const hiddenCount = tier === 'anonymous' ? Math.max(0, ratios.length - 3) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Finansal Rasyolar</h3>
        {tier === 'anonymous' && (
          <span className="text-sm text-gray-500">
            {hiddenCount} rasyo daha mevcut
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleRatios.map((ratio, index) => (
          <RatioComparisonCard key={ratio.ratioCode || index} {...ratio} tier={tier} />
        ))}
      </div>

      {/* Upgrade CTA */}
      {tier === 'anonymous' && hiddenCount > 0 && onUpgrade && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                +{hiddenCount} rasyo daha
              </p>
              <p className="text-sm text-gray-600">
                Üye olarak tüm rasyoları ve yorumları gör
              </p>
            </div>
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Üye Ol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

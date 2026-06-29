/**
 * SWOT Analiz Kartı
 * Shows Strengths, Weaknesses, Opportunities, Threats
 * Subscriber-only feature
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface SWOTItem {
  item: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
}

interface SWOTCardProps {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  overallAssessment: string | null;
  tier: 'anonymous' | 'member' | 'subscriber';
  onUpgrade?: () => void;
}

export function SWOTCard({
  strengths,
  weaknesses,
  opportunities,
  threats,
  overallAssessment,
  tier,
  onUpgrade,
}: SWOTCardProps) {
  const isLocked = tier !== 'subscriber';

  if (isLocked) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">SWOT Analizi</h3>
          <Lock className="h-4 w-4 text-gray-400" />
        </div>

        {/* Blurred Preview */}
        <div className="grid grid-cols-2 gap-4 filter blur-sm select-none">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-700 mb-2">Güçlü Yönler</div>
            <div className="space-y-1">
              <div className="h-3 bg-green-200 rounded w-3/4" />
              <div className="h-3 bg-green-200 rounded w-1/2" />
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-sm font-medium text-red-700 mb-2">Zayıf Yönler</div>
            <div className="space-y-1">
              <div className="h-3 bg-red-200 rounded w-2/3" />
              <div className="h-3 bg-red-200 rounded w-1/2" />
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-700 mb-2">Fırsatlar</div>
            <div className="space-y-1">
              <div className="h-3 bg-blue-200 rounded w-3/4" />
              <div className="h-3 bg-blue-200 rounded w-2/3" />
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-700 mb-2">Tehditler</div>
            <div className="space-y-1">
              <div className="h-3 bg-yellow-200 rounded w-1/2" />
              <div className="h-3 bg-yellow-200 rounded w-2/3" />
            </div>
          </div>
        </div>

        {/* Upgrade Overlay */}
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="font-medium text-gray-900 mb-2">
              SWOT Analizi Abonelik Gerektirir
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Detaylı SWOT analizi ve 20+ finansal metrik için abone olun
            </p>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Abone Ol - SWOT'a Eriş
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">SWOT Analizi</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <SWOTQuadrant
          title="Güçlü Yönler"
          icon={<TrendingUp className="h-5 w-5" />}
          items={strengths}
          color="green"
        />

        {/* Weaknesses */}
        <SWOTQuadrant
          title="Zayıf Yönler"
          icon={<TrendingDown className="h-5 w-5" />}
          items={weaknesses}
          color="red"
        />

        {/* Opportunities */}
        <SWOTQuadrant
          title="Fırsatlar"
          icon={<Lightbulb className="h-5 w-5" />}
          items={opportunities}
          color="blue"
        />

        {/* Threats */}
        <SWOTQuadrant
          title="Tehditler"
          icon={<AlertTriangle className="h-5 w-5" />}
          items={threats}
          color="yellow"
        />
      </div>

      {/* Overall Assessment */}
      {overallAssessment && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Genel Değerlendirme</h4>
          <p className="text-sm text-gray-600">{overallAssessment}</p>
        </div>
      )}
    </div>
  );
}

function SWOTQuadrant({
  title,
  icon,
  items,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  items: SWOTItem[];
  color: 'green' | 'red' | 'blue' | 'yellow';
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-100 text-green-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
  };

  const impactColors = {
    high: 'font-semibold',
    medium: 'font-medium',
    low: 'font-normal',
  };

  return (
    <div className={cn('p-4 rounded-lg border', colorClasses[color])}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-medium">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className={cn('text-sm', impactColors[item.impact])}>
            • {item.item}
            {item.impact === 'high' && (
              <span className="ml-2 text-xs opacity-60">(Yüksek etki)</span>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm opacity-60">Veri yetersiz</li>
        )}
      </ul>
    </div>
  );
}

/**
 * Compact SWOT Badge for inline display
 */
export function SWOTBadge({ 
  tier, 
  onUpgrade 
}: { 
  tier: 'anonymous' | 'member' | 'subscriber';
  onUpgrade?: () => void;
}) {
  if (tier === 'subscriber') {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full">
      <Lock className="h-3 w-3 text-purple-500" />
      <span className="text-xs text-purple-700">
        SWOT Analizi {tier === 'member' ? 'Abone' : 'Üye'} özelliğidir
      </span>
      {onUpgrade && (
        <button
          onClick={onUpgrade}
          className="text-xs text-purple-600 font-medium hover:underline"
        >
          Yükselt
        </button>
      )}
    </div>
  );
}

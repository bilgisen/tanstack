// lib/tiers.ts

export const TIER_CONFIG = {
  free: {
    displayName: 'Üye',
    monthlyJT: 5_000,
    dailyCallLimit: 20,
    watchlistLimit: 5,
    historyDays: 7,
    price: 0,
    currency: 'TL',
  },
  jetabone: {
    displayName: 'JetAbone',
    monthlyJT: 100_000,
    dailyCallLimit: 200,
    watchlistLimit: 50,
    historyDays: 90,
    price: 799,
    currency: 'TL',
    polarProductId: '21cce3c0-6541-4e3d-81be-d8287e78eb0f',
  },
  proabone: {
    displayName: 'ProAbone',
    monthlyJT: 500_000,
    dailyCallLimit: null,
    watchlistLimit: null,
    historyDays: null,
    price: 1499,
    currency: 'TL',
    polarProductId: '575bb0d5-44c3-49d6-aaba-fa8a9b0cc08c',
  },
} as const;

export type Tier = keyof typeof TIER_CONFIG;

export const TIER_POLAR_MAP: Record<string, { price: number; monthlyJT: number; polarProductId: string }> = {
  jetabone: { price: 799, monthlyJT: 100_000, polarProductId: '21cce3c0-6541-4e3d-81be-d8287e78eb0f' },
  proabone: { price: 1499, monthlyJT: 500_000, polarProductId: '575bb0d5-44c3-49d6-aaba-fa8a9b0cc08c' },
};

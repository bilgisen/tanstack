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
    dodoProductId: 'pdt_0NjpffB3aBE7RwdXJULbw',
  },
  proabone: {
    displayName: 'ProAbone',
    monthlyJT: 500_000,
    dailyCallLimit: null,
    watchlistLimit: null,
    historyDays: null,
    price: 1499,
    currency: 'TL',
    dodoProductId: 'pdt_0NkGi2vCdyy51kPeIqNoS',
  },
} as const;

export type Tier = keyof typeof TIER_CONFIG;

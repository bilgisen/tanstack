// lib/tiers.ts

export const TIER_CONFIG = {
  free: {
    displayName: 'Üye',
    monthlyHT: 5_000,
    dailyCallLimit: 20,
    watchlistLimit: 5,
    historyDays: 7,
    canBuyExtra: false,
    price: 0,
    currency: 'TL',
  },
  standard: {
    displayName: 'Standart',
    monthlyHT: 10_000,
    dailyCallLimit: 100,
    watchlistLimit: 25,
    historyDays: 30,
    canBuyExtra: true,
    price: 399,
    currency: 'TL',
  },
  pro: {
    displayName: 'Pro',
    monthlyHT: 50_000,
    dailyCallLimit: 500,
    watchlistLimit: 100,
    historyDays: null, // unlimited
    canBuyExtra: true,
    price: 1499,
    currency: 'TL',
  },
  ultimate: {
    displayName: 'Ultimate',
    monthlyHT: 200_000,
    dailyCallLimit: null, // unlimited
    watchlistLimit: null, // unlimited
    historyDays: null, // unlimited
    canBuyExtra: true,
    price: 4999,
    currency: 'TL',
  },
} as const;

export type Tier = keyof typeof TIER_CONFIG;

// Extra HT Pricing Config
export const EXTRA_HT_PRICING = {
  amount: 10_000,
  price: 449, // 10.000 HT ek kredi = 449 TL (Standart pakete göre orantılı)
  currency: 'TL',
} as const;

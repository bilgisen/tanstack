export const RATIO_CATEGORIES = {
  degerleme: 'Değerleme',
  karlilik: 'Karlılık',
  finansal_saglik: 'Finansal Sağlık',
  likidite: 'Likidite',
  verimlilik: 'Verimlilik',
  buyume: 'Büyüme',
  hisse_basi: 'Hisse Başı',
} as const

export type RatioCategory = keyof typeof RATIO_CATEGORIES

export type RatioDef = {
  code: string
  label: string
  category: RatioCategory
  higherIsBetter: boolean
  format: 'decimal' | 'percent' | 'ratio'
  suffix?: string
}

export const RATIO_DEFS: RatioDef[] = [
  // ── Değerleme ──
  { code: 'pe', label: 'F/K', category: 'degerleme', higherIsBetter: false, format: 'decimal' },
  { code: 'pb', label: 'PD/DD', category: 'degerleme', higherIsBetter: false, format: 'decimal' },
  { code: 'ev_ebitda', label: 'FD/FAVÖK', category: 'degerleme', higherIsBetter: false, format: 'decimal' },
  { code: 'ev_sales', label: 'FD/Satışlar', category: 'degerleme', higherIsBetter: false, format: 'decimal' },
  { code: 'ev_ebit', label: 'FD/FAVK', category: 'degerleme', higherIsBetter: false, format: 'decimal' },
  { code: 'price_to_sales', label: 'F/Satış', category: 'degerleme', higherIsBetter: false, format: 'decimal' },
  { code: 'price_to_cash_flow', label: 'F/Nakit Akış', category: 'degerleme', higherIsBetter: false, format: 'decimal' },
  { code: 'earnings_yield', label: 'Kazanç Verimi', category: 'degerleme', higherIsBetter: true, format: 'percent' },

  // ── Karlılık ──
  { code: 'roe', label: 'ROE', category: 'karlilik', higherIsBetter: true, format: 'percent' },
  { code: 'roa', label: 'ROA', category: 'karlilik', higherIsBetter: true, format: 'percent' },
  { code: 'net_margin', label: 'Net Kar Marjı', category: 'karlilik', higherIsBetter: true, format: 'percent' },
  { code: 'gross_margin', label: 'Brüt Kar Marjı', category: 'karlilik', higherIsBetter: true, format: 'percent' },
  { code: 'operating_margin', label: 'Faaliyet Kar Marjı', category: 'karlilik', higherIsBetter: true, format: 'percent' },
  { code: 'ebitda_margin', label: 'FAVÖK Marjı', category: 'karlilik', higherIsBetter: true, format: 'percent' },
  { code: 'return_on_capital', label: 'ROIC', category: 'karlilik', higherIsBetter: true, format: 'percent' },
  { code: 'return_on_employed', label: 'ROCE', category: 'karlilik', higherIsBetter: true, format: 'percent' },

  // ── Finansal Sağlık ──
  { code: 'debt_equity', label: 'Borç/Özkaynak', category: 'finansal_saglik', higherIsBetter: false, format: 'decimal' },
  { code: 'debt_ratio', label: 'Borç Oranı', category: 'finansal_saglik', higherIsBetter: false, format: 'percent' },
  { code: 'interest_coverage', label: 'Faiz Karş. Oranı', category: 'finansal_saglik', higherIsBetter: true, format: 'decimal' },
  { code: 'equity_ratio', label: 'Özkaynak Oranı', category: 'finansal_saglik', higherIsBetter: true, format: 'percent' },
  { code: 'net_debt_ebitda', label: 'Net Borç/FAVÖK', category: 'finansal_saglik', higherIsBetter: false, format: 'decimal' },
  { code: 'net_debt_equity', label: 'Net Borç/Özkaynak', category: 'finansal_saglik', higherIsBetter: false, format: 'decimal' },

  // ── Likidite ──
  { code: 'current_ratio', label: 'Cari Oran', category: 'likidite', higherIsBetter: true, format: 'decimal' },
  { code: 'quick_ratio', label: 'Likidite Oranı', category: 'likidite', higherIsBetter: true, format: 'decimal' },
  { code: 'cash_ratio', label: 'Nakit Oranı', category: 'likidite', higherIsBetter: true, format: 'decimal' },

  // ── Verimlilik ──
  { code: 'asset_turnover', label: 'Aktif Devir Hızı', category: 'verimlilik', higherIsBetter: true, format: 'decimal' },
  { code: 'inventory_turnover', label: 'Stok Devir Hızı', category: 'verimlilik', higherIsBetter: true, format: 'decimal' },
  { code: 'receivables_turnover', label: 'Alacak Devir Hızı', category: 'verimlilik', higherIsBetter: true, format: 'decimal' },
  { code: 'days_inventory', label: 'Stokta Kalma Süresi', category: 'verimlilik', higherIsBetter: false, format: 'decimal', suffix: 'gün' },
  { code: 'days_receivables', label: 'Alacak Tahsil Süresi', category: 'verimlilik', higherIsBetter: false, format: 'decimal', suffix: 'gün' },
  { code: 'cash_conversion_cycle', label: 'Nakit Dönüşüm Süresi', category: 'verimlilik', higherIsBetter: false, format: 'decimal', suffix: 'gün' },

  // ── Büyüme ──
  { code: 'profit_growth', label: 'Kar Büyümesi', category: 'buyume', higherIsBetter: true, format: 'percent' },
  { code: 'revenue_growth', label: 'Satış Büyümesi', category: 'buyume', higherIsBetter: true, format: 'percent' },
  { code: 'eps_growth', label: 'HBK Büyümesi', category: 'buyume', higherIsBetter: true, format: 'percent' },
  { code: 'equity_growth', label: 'Özkaynak Büyümesi', category: 'buyume', higherIsBetter: true, format: 'percent' },
  { code: 'asset_growth', label: 'Aktif Büyümesi', category: 'buyume', higherIsBetter: true, format: 'percent' },

  // ── Hisse Başı ──
  { code: 'eps', label: 'HBK', category: 'hisse_basi', higherIsBetter: true, format: 'decimal' },
  { code: 'book_per_share', label: 'Defter Değeri', category: 'hisse_basi', higherIsBetter: true, format: 'decimal' },
  { code: 'revenue_per_share', label: 'Hisse Başı Satış', category: 'hisse_basi', higherIsBetter: true, format: 'decimal' },
  { code: 'cash_flow_per_share', label: 'Hisse Başı Nakit', category: 'hisse_basi', higherIsBetter: true, format: 'decimal' },
]

export const RATIO_MAP = Object.fromEntries(
  RATIO_DEFS.map(d => [d.code, d])
) as Record<string, RatioDef>

export const RATIO_LABELS = Object.fromEntries(
  RATIO_DEFS.map(d => [d.code, d.label])
) as Record<string, string>

export const HIGHER_IS_BETTER = Object.fromEntries(
  RATIO_DEFS.map(d => [d.code, d.higherIsBetter])
) as Record<string, boolean>

export function getRatioDef(code: string): RatioDef | undefined {
  return RATIO_MAP[code]
}

export function getRatioLabel(code: string): string {
  return RATIO_LABELS[code] || code
}

export function formatRatioValue(code: string, value: number | null | undefined): string {
  if (value == null) return '—'
  const def = RATIO_MAP[code]
  if (!def) return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const opts = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

  if (def.format === 'percent') {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }
  const formatted = value.toLocaleString('tr-TR', opts)
  return def.suffix ? `${formatted} ${def.suffix}` : formatted
}

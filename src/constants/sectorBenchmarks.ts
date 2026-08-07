export const BENCHMARK_LABELS: Record<string, string> = {
  pe: 'F/K', pb: 'PD/DD', ev_ebitda: 'FD/FAVÖK', ev_sales: 'FD/Satışlar',
  current_ratio: 'Cari Oran', cash_ratio: 'Nakit Oranı', debt_equity: 'Borç/Özkaynak',
  interest_coverage: 'Faiz Karş. Oranı',
  roe: 'ROE', roa: 'ROA', net_margin: 'Net Kar Marjı', gross_margin: 'Brüt Kar Marjı',
  profit_growth: 'Kar Büyümesi',
  eps: 'HBK', book_per_share: 'Defter Değeri', inventory_turnover: 'Stok Devir Hızı',
}

export const BENCHMARK_CATEGORIES: Record<string, string> = {
  pe: 'Değerleme', pb: 'Değerleme', ev_ebitda: 'Değerleme', ev_sales: 'Değerleme',
  current_ratio: 'Likidite', cash_ratio: 'Likidite', debt_equity: 'Fin. Sağlık', interest_coverage: 'Fin. Sağlık',
  roe: 'Karlılık', roa: 'Karlılık', net_margin: 'Karlılık', gross_margin: 'Karlılık',
  profit_growth: 'Büyüme',
  eps: 'Hisse Başı', book_per_share: 'Hisse Başı', inventory_turnover: 'Verimlilik',
}

export type BenchmarkCodes = keyof typeof BENCHMARK_LABELS

export function getBenchmarkLabel(code: string): string {
  return BENCHMARK_LABELS[code] || code
}

export function getBenchmarkCategory(code: string): string {
  return BENCHMARK_CATEGORIES[code] || 'Diğer'
}
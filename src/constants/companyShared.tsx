import companyNames from './companyNames.json'

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/i̇/g, 'i') // Handle İ → i̇ after lowercase (combining dot)
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const SLUG_TO_NAME: Record<string, string> = {
  'saglik-ilac': 'Sağlık & İlaç',
  'gida-icecek-tarim': 'Gıda & İçecek & Tarım',
  'diger': 'Diğer',
  'sanayi-metal-kimya': 'Sanayi & Metal & Kimya',
  'holdingler': 'Holdingler',
  'gyo-gayrimenkul': 'GYO (Gayrimenkul)',
  'otomotiv-savunma-makine': 'Otomotiv & Savunma & Makine',
  'turizm-medya-eglence': 'Turizm & Medya & Eğlence',
  'sigortacilik': 'Sigortacılık',
  'ulasim-lojistik': 'Ulaştırma & Lojistik',
  'tuketim-perakende-tekstil': 'Tüketim & Perakende & Tekstil',
  'insaat-yapi-malzemeleri': 'İnşaat & Yapı Malzemeleri',
  'spor': 'Spor',
  'bankacilik-finans': 'Bankacılık & Finans',
  'enerji-uretim-dagitim-petrol': 'Enerji (Üretim + Dağıtım + Petrol)',
  'teknoloji-iletisim': 'Teknoloji & İletişim',
}

export type CompanyStats = {
  name: string
  code: string
  price: number
  diffPercent: number
  high: number
  low: number
  open: number
  close: number
  volume: string
}

export type TaData = {
  trend: string
  score: number
  confidence: string
  rsi: { value: number; status: string }
  macd: string
  bollinger_status: string
  sma: { sma_20: number; sma_50: number; sma_200: number }
  support_resistance: { support: number; resistance: number }
  atr_stop_loss: number
  rr_ratio: number
  beta: number
  market_breadth: { breadth: number; status: string }
  market_regime: { regime: string; trend_direction: string; volatility_regime: string; adx: number; recommended_strategy: string }
  signals: string[]
  divergences: { rsi: { bullish: boolean; bearish: boolean }; macd: { bullish: boolean; bearish: boolean } }
  score_components: { trend: number; momentum: number; volume: number }
  candlestick_patterns: string[]
} | null

export type FundamentalData = {
  fk: string
  roe: string
  currentRatio: string
  debtToEquity: string
  sector: string
}

export type FundamentalDetail = {
  volume: number
  quantity: number
  weekClose: number
  weekHigh: number
  weekLow: number
  monthClose: number
  monthHigh: number
  monthLow: number
  yearClose: number
  prevYearClose: number
  dayClose: number
  basePrice: number
  equity: number
  capital: number
  circulationShare: number
}

export function ScoreGauge({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(score, 0), 100)
  const offset = circ - (pct / 100) * circ
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-foreground leading-none">{score}</span>
        <span className="text-[8px] text-muted-foreground font-medium mt-0.5">/100</span>
      </div>
    </div>
  )
}

export function SignalBadge({ signal }: { signal: string }) {
  const isPositive = signal.startsWith('✓')
  const isNegative = signal.startsWith('✗')
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg ${
      isPositive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
      : isNegative ? 'bg-destructive/10 text-destructive border border-destructive/20'
      : 'bg-muted/30 text-muted-foreground border border-border/30'
    }`}>
      {signal}
    </span>
  )
}

export async function fetchCompanyData(tickerUpper: string, slug: string) {
  const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev"
  const officialName = (companyNames as Record<string, string>)[tickerUpper] || tickerUpper
  const sectorName = SLUG_TO_NAME[slug] || slug

  // Try batch endpoint first (single request for all data)
  try {
    const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/company-data`)
    if (res.ok) {
      const json = await res.json()
      if (json.success && json.stats) {
        return {
          stats: { ...json.stats, name: officialName },
          taData: json.taData,
          fundamental: json.fundamental || { fk: '-', roe: '-', currentRatio: '-', debtToEquity: '-', sector: sectorName },
          fundamentalDetail: json.fundamentalDetail,
          sectorName
        }
      }
    }
  } catch (e) {
    console.warn('Batch company-data failed, falling back to individual endpoints:', e)
  }

  // Fallback: Individual endpoints (legacy)
  let lastPrice = 0
  let diffPercent = 0
  let high = 0
  let low = 0
  let open = 0
  let close = 0
  let volume = '-'

  try {
    const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/summary-card`)
    if (res.ok) {
      const json = await res.json()
      if (json && !json.error) {
        lastPrice = json.last_price || 0
        diffPercent = json.diff_percent || 0
        high = json.high || lastPrice * 1.02
        low = json.low || lastPrice * 0.98
        open = json.open || lastPrice * 0.99
        close = json.close || lastPrice
        volume = json.volume || volume
      }
    }
  } catch (e) { console.error('summary-card fetch failed', e) }

  const stats: CompanyStats = { name: officialName, code: tickerUpper, price: lastPrice, diffPercent, high, low, open, close, volume }

  let taData: TaData = null
  try {
    const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/ta/summary`)
    if (res.ok) {
      const json = await res.json()
      if (json && !json.error) {
        const rsiData = json.rsi && typeof json.rsi === 'object' && 'value' in json.rsi
          ? json.rsi
          : { value: typeof json.rsi === 'number' ? json.rsi : parseFloat(json.rsi) || 50, status: json.rsi_status || 'Nötr' }
        taData = {
          trend: json.trend || 'Nötr',
          score: json.score ?? 50,
          confidence: json.confidence || 'Veri yok',
          rsi: rsiData,
          macd: json.macd_status || json.macd || 'Nötr',
          bollinger_status: json.bollinger_status || 'Orta Bantta',
          sma: { sma_20: json.sma?.sma_20 || lastPrice, sma_50: json.sma?.sma_50 || lastPrice, sma_200: json.sma?.sma_200 || lastPrice },
          support_resistance: {
            support: json.support_resistance?.support ?? json.support ?? (lastPrice * 0.96),
            resistance: json.support_resistance?.resistance ?? json.resistance ?? (lastPrice * 1.04),
          },
          atr_stop_loss: json.atr_stop_loss || json.stop_loss || (lastPrice * 0.97),
          rr_ratio: json.rr_ratio || 0,
          beta: json.beta ?? 1,
          market_breadth: { breadth: json.market_breadth?.breadth ?? 50, status: json.market_breadth?.status || 'Veri yok' },
          market_regime: {
            regime: json.market_regime?.regime || 'Veri yok',
            trend_direction: json.market_regime?.trend_direction || 'Veri yok',
            volatility_regime: json.market_regime?.volatility_regime || 'Veri yok',
            adx: json.market_regime?.adx ?? 0,
            recommended_strategy: json.market_regime?.recommended_strategy || '',
          },
          signals: json.signals || [],
          divergences: {
            rsi: json.divergences?.rsi || { bullish: false, bearish: false },
            macd: json.divergences?.macd || { bullish: false, bearish: false },
          },
          score_components: {
            trend: json.score_components?.trend ?? 0,
            momentum: json.score_components?.momentum ?? 0,
            volume: json.score_components?.volume ?? 0,
          },
          candlestick_patterns: json.candlestick_patterns || [],
        }
      }
    }
  } catch (e) { console.error('ta/summary fetch failed', e) }

  const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev"
  let fundamental: FundamentalData = { fk: '-', roe: '-', currentRatio: '-', debtToEquity: '-', sector: sectorName }
  
  // Fetch P/E ratio from COMP profile endpoint (more reliable)
  let peRatio: string | null = null
  try {
    const profileRes = await fetch(`${compUrl}/api/v1/companies/${tickerUpper}/profile`)
    if (profileRes.ok) {
      const profileJson = await profileRes.json()
      if (profileJson.market_data?.pe_ratio != null) {
        peRatio = profileJson.market_data.pe_ratio.toFixed(2)
      }
    }
  } catch (e) {
    console.warn('COMP profile fetch failed, will fallback to finveri:', e)
  }
  
  try {
    const res = await fetch(`${compUrl}/api/v1/companies/${tickerUpper}/ratios`)
    if (res.ok) {
      const json = await res.json()
      const ratios = json.ratios || {}
      fundamental = {
        fk: peRatio || '-', // Use COMP pe_ratio if available
        roe: ratios.roe?.value != null ? (ratios.roe.value * 100).toFixed(1) + '%' : '-',
        currentRatio: ratios.current_ratio?.value != null ? ratios.current_ratio.value.toFixed(2) : '-',
        debtToEquity: ratios.debt_to_equity?.value != null ? ratios.debt_to_equity.value.toFixed(2) : '-',
        sector: json.sector || sectorName,
      }
    }
  } catch (e) { console.error('comp ratios fetch failed', e) }
  
  const finveriUrl = "https://finveri-cbe8c089.fastapicloud.dev"
  let fundamentalDetail: FundamentalDetail | null = null
  try {
    const detailRes = await fetch(`${finveriUrl}/instruments/stocks/${tickerUpper}/detail`)
    if (detailRes.ok) {
      const d = await detailRes.json()
      fundamentalDetail = {
        volume: d.volume || 0,
        quantity: d.quantity || 0,
        weekClose: d.week_close || 0,
        weekHigh: d.week_high || 0,
        weekLow: d.week_low || 0,
        monthClose: d.month_close || 0,
        monthHigh: d.month_high || 0,
        monthLow: d.month_low || 0,
        yearClose: d.year_close || 0,
        prevYearClose: d.prev_year_close || 0,
        dayClose: d.day_close || 0,
        basePrice: d.base_price || 0,
        equity: d.equity || 0,
        capital: d.capital || 0,
        circulationShare: d.circulation_share || 0,
      }
      if (lastPrice === 0 && d.last) {
        lastPrice = d.last
        open = d.open || 0
        high = d.high || 0
        low = d.low || 0
        close = d.day_close || d.last
      }
      if (volume === '-' && d.volume) {
        volume = d.volume
      }
    }
  } catch (e) { console.error('finveri detail fetch failed', e) }

  try {
    const fundRes = await fetch(`${finveriUrl}/instruments/stocks/${tickerUpper}/fundamental`)
    if (fundRes.ok) {
      const fund = await fundRes.json()
      // Only use Finveri data as fallback if COMP didn't provide pe_ratio
      if (fund.pe_ratio != null && !peRatio) {
        fundamental.fk = fund.pe_ratio.toFixed(2)
      }
      if (fund.roe != null && fundamental.roe === '-') {
        fundamental.roe = (fund.roe * 100).toFixed(1) + '%'
      }
      if (fund.current_ratio != null && fundamental.currentRatio === '-') {
        fundamental.currentRatio = fund.current_ratio.toFixed(2)
      }
      if (fund.debt_to_equity != null && fundamental.debtToEquity === '-') {
        fundamental.debtToEquity = fund.debt_to_equity.toFixed(2)
      }
      if (fund.sector) {
        fundamental.sector = fund.sector
      }
    }
  } catch (e) { console.error('finveri fundamental fetch failed', e) }

  return { stats, taData, fundamental, fundamentalDetail, sectorName }
}

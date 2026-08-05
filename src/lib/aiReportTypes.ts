export interface AiReportOverview {
  ticker?: string
  current_price?: number
  unit?: string
  report_date?: string
  executive_summary?: string
  overview?: {
    technical_score?: number
    confidence?: string
    confidence_reason?: string
    price_character?: string
    market_regime?: string
    trend_direction?: string
    timeframe?: string
    confluence_score?: number
    confluence_direction?: string
    confluence_label?: string
    score_components?: {
      trend?: number
      momentum?: number
      volume?: number
      pattern?: number
    }
    recommended_strategy?: string
  }
  risk_assessment?: {
    technical_risks?: Array<string>
    technical_opportunities?: Array<string>
    beta?: number | null
    market_breadth?: number | null
  }
  izlenmesi_gerekenler?: {
    not?: string
    kritik_seviyeler?: Array<string>
    izlenecek_konular?: Array<string>
  }
}

export interface AiReportIndicators {
  ticker?: string
  indicators?: {
    rsi?: { value?: number; interpretation?: string; status?: string }
    macd?: { macd_line?: number; signal_line?: number; histogram?: number; interpretation?: string }
    moving_averages?: {
      sma_20?: number
      sma_50?: number
      sma_200?: number
      ema_9?: number
      ema_21?: number
      golden_cross?: boolean
      price_vs_sma20?: string
      price_vs_ema9?: string
      price_vs_ema21?: string
    }
    volatility?: { atr?: number; atr_percent?: number; bollinger_upper?: number; bollinger_lower?: number }
    volume?: { obv_trend?: string; mfi?: number }
    stochastic?: { k?: number; d?: number; status?: string }
    supertrend?: { value?: number; direction?: string }
    vwap?: number
    adx_details?: { adx?: number; efficiency_ratio?: number }
  }
  score_components?: {
    trend?: number
    momentum?: number
    volume?: number
    pattern?: number
  }
  divergences?: {
    divergence_count?: number
    rsi?: { bullish?: boolean; bearish?: boolean }
    macd?: { bullish?: boolean; bearish?: boolean }
    obv?: { bullish?: boolean; bearish?: boolean }
    summary?: string
    confluence_score?: number
  }
  volume_profile?: {
    poc?: number
    value_area_low?: number
    value_area_high?: number
  }
}

export interface AiReportKeyLevels {
  current_price?: number
  key_levels?: {
    support_1?: { price?: number; importance?: string; scenario?: string }
    support_2?: { price?: number; importance?: string; scenario?: string }
    resistance_1?: { price?: number; importance?: string; scenario?: string }
    resistance_2?: { price?: number; importance?: string; scenario?: string }
    stop_loss?: number
    take_profit?: number
    risk_reward_ratio?: number
  }
  volume_profile_poc?: number
}

export interface AiReportPatterns {
  patterns?: {
    candlestick?: Array<{ name?: string; direction?: string; reliability?: string; bars_ago?: number }>
    chart?: Array<{
      name?: string
      direction?: string
      confidence?: number | string
      entry_price?: number
      target_price?: number
      volume_confirmed?: boolean
    }>
    pattern_score?: number
    pattern_direction?: string
    active_count?: number
  }
  liquidity_voids?: Array<{
    price?: number
    gap_percent?: number
    severity?: string
    direction?: string
    bars_ago?: number
  }>
}

export interface AiReportScenarios {
  scenarios?: {
    positive?: { name?: string; conditions?: Array<string>; target?: number | string; probability?: number | string; invalidation?: number | string }
    neutral?: { name?: string; conditions?: Array<string>; strategy?: string; probability?: number | string; invalidation?: number | string }
    negative?: { name?: string; conditions?: Array<string>; risk?: number | string; probability?: number | string; invalidation?: number | string }
  }
  key_levels?: {
    stop_loss?: number
    take_profit?: number
    risk_reward_ratio?: number
  }
}

export interface AiAnalysis {
  narrative?: string
  sonuc?: Array<string>
  questions?: Array<string>
  retryable?: boolean
  reason?: string
  detail?: string
  deterministic?: boolean
}

export interface AiReportSections {
  overview?: AiReportOverview
  indicators?: AiReportIndicators
  key_levels?: AiReportKeyLevels
  patterns?: AiReportPatterns
  scenarios?: AiReportScenarios
  ai_analysis?: AiAnalysis
}

export interface AiReportData {
  ticker?: string
  report_date?: string
  current_price?: number
  unit?: string
  sections?: AiReportSections
  _stale?: Record<string, boolean>
  _generated_at?: number
}
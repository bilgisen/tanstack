export interface TAPublicSummary {
  ticker: string;
  price: number;
  change_pct: number | null;
  date: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  regime: string | null;
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  sma: { sma_20: number | null; sma_50: number | null; sma_200: number | null };
  rsi: number | null;
  macd_status: 'Bullish' | 'Bearish';
  nearest_support: number | null;
  nearest_resistance: number | null;
  summary_text: string;
}

export interface TAMemberSummary {
  ticker: string;
  price: number;
  change_pct: number | null;
  indicators: IndicatorSummary;
  trend: string;
  weekly_trend: string;
  regime: MarketRegime;
  volume_profile: VolumeProfile;
  liquidity_voids: LiquidityVoid[];
  sr_zones: SupportResistance;
  score: number;
  confidence: string;
  score_components: { trend: number; momentum: number; volume: number };
  signals: string[];
  divergences: DivergenceAnalysis;
  golden_cross: GoldenCrossInfo;
  mtf_alignment: MTFAlignment;
  summary_text: string;
}

export interface IndicatorSummary {
  rsi: number | null;
  macd: MACD | null;
  sma: SMA;
  ema_9: number | null;
  ema_21: number | null;
  bbands: BollingerBands;
  atr: number | null;
  atr_pct: number | null;
  stoch: StochData;
  adx: ADXData;
  obv: number | null;
  mfi: number | null;
  supertrend: number | null;
  supertrend_direction: 'up' | 'down' | null;
  vwap: number | null;
}

export interface MACD { value: number | null; signal: number | null; histogram: number | null; }
export interface BollingerBands { upper: number | null; middle: number | null; lower: number | null; }
export interface StochData { k: number | null; d: number | null; }
export interface ADXData { adx: number | null; plus_di: number | null; minus_di: number | null; }
export interface SMA { sma_20: number | null; sma_50: number | null; sma_200: number | null; }

export interface MarketRegime {
  regime: string;
  trend_direction: string;
  volatility_regime: string;
  adx: number | null;
  efficiency_ratio: number | null;
  volatility_pct: number | null;
  confidence: number;
  recommended_strategy: string;
  interpretation: string;
}

export interface VolumeProfile {
  poc: number | null;
  poc_volume: number | null;
  value_area_high: number | null;
  value_area_low: number | null;
  total_volume: number | null;
}

export interface LiquidityVoid {
  date: string;
  gap_start: number;
  gap_end: number;
  gap_size: number;
  gap_pct: number;
  direction: 'up' | 'down';
  bars_ago: number;
}

export interface SRLevel { price: number; type: string; strength: number; }
export interface SupportResistance {
  current_price: number;
  resistance_zones: SRLevel[];
  support_zones: SRLevel[];
  nearest_resistance: SRLevel | null;
  nearest_support: SRLevel | null;
}

export interface DivergenceAnalysis {
  rsi: { bullish: boolean; bearish: boolean };
  macd: { bullish: boolean; bearish: boolean };
  obv: { bullish: boolean; bearish: boolean };
  overall_confidence: string;
  divergence_count: number;
}

export interface GoldenCrossInfo {
  has_golden_cross: boolean;
  has_death_cross: boolean;
  bars_since_cross: number | null;
  sma_20_minus_sma_50: number | null;
}

export interface MTFAlignment {
  daily_trend: string;
  weekly_trend: string;
  monthly_trend: string;
  alignment_score: number;
  alignment_label: string;
}

export interface TAFullAnalysis {
  ticker: string;
  price: number;
  change_pct: number | null;
  trend: string;
  weekly_trend: string;
  indicators: IndicatorSummary;
  golden_cross: GoldenCrossInfo;
  trend_age: { daily_direction: string; daily_bars: number };
  mtf_alignment: MTFAlignment;
  volume_metrics: VolumeMetrics;
  regime: MarketRegime;
  volume_profile: VolumeProfile;
  liquidity_voids: LiquidityVoid[];
  sr_zones: SupportResistance;
  patterns: PatternAnalysis;
  divergences: DivergenceAnalysis;
  scenarios: Scenario[];
  risk_metrics: RiskMetrics;
  score: CompositeScore;
  signals: ActiveSignal[];
  llm_summary_prompt: string;
}

export interface VolumeMetrics { obv_trend: string; relative_volume: number | null; volume_confirmation: string; }
export interface PatternAnalysis { candlestick_patterns: CandlestickPattern[]; chart_patterns: ChartPattern[]; total_active: number; }
export interface CandlestickPattern { name: string; direction: string; reliability: number; bars_ago: number; confirmation_volume: boolean; }
export interface ChartPattern { name: string; direction: string; entry_price: number | null; target_price: number | null; confidence: number; }
export interface Scenario { name: string; direction: string; trigger_price: number | null; target_price: number | null; invalidation_price: number | null; supporting_signal_count: number; description: string; }
export interface RiskMetrics { atr_based_stop_loss: number | null; atr_pct: number | null; volatility_classification: string; }
export interface CompositeScore { total: number; confidence: string; components: { trend: number; momentum: number; volume: number; pattern: number; }; }
export interface ActiveSignal { label: string; direction: string; source: string; freshness: string; }

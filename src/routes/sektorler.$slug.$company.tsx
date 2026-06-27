import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, TrendingUp, TrendingDown, Activity, BarChart3, Target, AlertTriangle, CandlestickChart, HelpCircle, Compass, Shield, TrendingDown as TrendDownIcon, Zap, Gauge, LineChart } from 'lucide-react'
import { useEffect, useState } from 'react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { Skeleton } from '../components/ui/skeleton'
import { TradingViewChart } from '../components/dashboard/TradingViewChart'
import { useChatStore } from '../store/chat'

export const Route = createFileRoute('/sektorler/$slug/$company')({
  component: CompanyDetailPage,
})

type CompanyStats = {
  name: string;
  code: string;
  price: number;
  diffPercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: string;
};

type TaData = {
  trend: string;
  weekly_trend: string;
  score: number;
  confidence: string;
  rsi: { value: number; status: string };
  macd: string;
  bollinger_status: string;
  sma: { sma_20: number; sma_50: number; sma_200: number };
  support_resistance: { support: number; resistance: number };
  atr_stop_loss: number;
  rr_ratio: number;
  beta: number;
  market_breadth: { breadth: number; status: string };
  market_regime: { regime: string; trend_direction: string; volatility_regime: string; adx: number; recommended_strategy: string };
  signals: string[];
  divergences: { rsi: { bullish: boolean; bearish: boolean }; macd: { bullish: boolean; bearish: boolean } };
  score_components: { trend: number; momentum: number; volume: number };
  candlestick_patterns: string[];
} | null;

type FundamentalData = {
  fk: string;
  roe: string;
  currentRatio: string;
  debtToEquity: string;
  sector: string;
};

const SLUG_TO_NAME: Record<string, string> = {
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
};

function ScoreGauge({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444';

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
  );
}

function SignalBadge({ signal }: { signal: string }) {
  const isPositive = signal.startsWith('✓');
  const isNegative = signal.startsWith('✗');
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg ${
      isPositive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
      : isNegative ? 'bg-destructive/10 text-destructive border border-destructive/20'
      : 'bg-muted/30 text-muted-foreground border border-border/30'
    }`}>
      {signal}
    </span>
  );
}

function CompanyDetailPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null)
  const [taData, setTaData] = useState<TaData>(null)
  const [fundamental, setFundamental] = useState<FundamentalData | null>(null)
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useChatStore()

  const chatContext = `sirket:${tickerUpper}`
  const sectorName = SLUG_TO_NAME[slug] || slug

  const technicalQuestions = [
    `${tickerUpper} için destek ve direnç noktalarını özetler misin?`,
    `${tickerUpper} RSI ve MACD teknik sinyalleri ne yönde?`,
    `${tickerUpper} güncel hareketli ortalama durumu nedir?`,
    `${tickerUpper} Bollinger Bandı konumu nasıl?`,
    `${tickerUpper} ATR bazlı stop-loss seviyesi kaç olmalıdır?`
  ]

  const fundamentalQuestions = [
    `${tickerUpper} bilançosundaki en kritik finansal oranlar neler?`,
    `${tickerUpper} F/K ve PD/DD oranları sektöre göre ucuz mu?`,
    `${tickerUpper} şirketi borçluluk seviyesi ve likiditesi nasıl?`,
    `${tickerUpper} Özsermaye karlılığı ve büyüme trendini yorumlar mısın?`,
    `Sektörel beklentilerin ${tickerUpper} hissesine etkisi nasıl olur?`
  ]

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchAll() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      const compUrl = import.meta.env.VITE_COMP_API_URL || "https://comp-ef958063.fastapicloud.dev";
      const officialName = (companyNames as Record<string, string>)[tickerUpper] || tickerUpper;
      let lastPrice = 0;
      let diffPercent = 0;
      let high = 0;
      let low = 0;
      let open = 0;
      let close = 0;
      let volume = '-';

      // 1. Symbol
      try {
        const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            lastPrice = typeof json.data.last_price === 'number' ? json.data.last_price : parseFloat(json.data.last_price) || 0;
            diffPercent = typeof json.data.diff_percent === 'number' ? json.data.diff_percent : parseFloat(json.data.diff_percent) || 0;
          }
        }
      } catch (e) { console.error('symbol fetch failed', e); }

      // 2. Summary card
      try {
        const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/summary-card`);
        if (res.ok) {
          const json = await res.json();
          if (json && !json.error) {
            lastPrice = json.last_price || lastPrice;
            diffPercent = json.diff_percent !== undefined ? json.diff_percent : diffPercent;
            high = json.high || lastPrice * 1.02;
            low = json.low || lastPrice * 0.98;
            open = json.open || lastPrice * 0.99;
            close = json.close || lastPrice;
            volume = json.volume || volume;
          }
        }
      } catch (e) { console.error('summary-card fetch failed', e); }

      if (isMounted) {
        setCompanyStats({ name: officialName, code: tickerUpper, price: lastPrice, diffPercent, high, low, open, close, volume });
      }

      // 3. TA Summary (rich)
      try {
        const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}/ta/summary`);
        if (res.ok) {
          const json = await res.json();
          if (json && !json.error) {
            const rsiData = json.rsi && typeof json.rsi === 'object' && 'value' in json.rsi
              ? json.rsi
              : { value: typeof json.rsi === 'number' ? json.rsi : parseFloat(json.rsi) || 50, status: json.rsi_status || 'Nötr' };

            if (isMounted) {
              setTaData({
                trend: json.trend || 'Nötr',
                weekly_trend: json.weekly_trend || 'Veri yok',
                score: json.score ?? 50,
                confidence: json.confidence || 'Veri yok',
                rsi: rsiData,
                macd: json.macd_status || json.macd || 'Nötr',
                bollinger_status: json.bollinger_status || 'Orta Bantta',
                sma: {
                  sma_20: json.sma?.sma_20 || lastPrice,
                  sma_50: json.sma?.sma_50 || lastPrice,
                  sma_200: json.sma?.sma_200 || lastPrice,
                },
                support_resistance: {
                  support: json.support_resistance?.support ?? json.support ?? (lastPrice * 0.96),
                  resistance: json.support_resistance?.resistance ?? json.resistance ?? (lastPrice * 1.04),
                },
                atr_stop_loss: json.atr_stop_loss || json.stop_loss || (lastPrice * 0.97),
                rr_ratio: json.rr_ratio || 0,
                beta: json.beta ?? 1,
                market_breadth: {
                  breadth: json.market_breadth?.breadth ?? 50,
                  status: json.market_breadth?.status || 'Veri yok',
                },
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
              });
            }
          }
        }
      } catch (e) { console.error('ta/summary fetch failed', e); }

      // 4. Fundamental from comp API
      try {
        const res = await fetch(`${compUrl}/api/v1/companies/${tickerUpper}/profile`);
        if (res.ok) {
          const json = await res.json();
          const ratios = json.key_ratios || {};
          if (isMounted) {
            setFundamental({
              fk: ratios.pe_ratio?.value != null ? ratios.pe_ratio.value.toFixed(2) : '-',
              roe: ratios.roe?.value != null ? (ratios.roe.value * 100).toFixed(1) + '%' : '-',
              currentRatio: ratios.current_ratio?.value != null ? ratios.current_ratio.value.toFixed(2) : '-',
              debtToEquity: ratios.debt_to_equity?.value != null ? ratios.debt_to_equity.value.toFixed(2) : '-',
              sector: json.sector_main || sectorName,
            });
          }
        }
      } catch (e) { console.error('comp profile fetch failed', e); }

      // Fallback if comp API failed
      if (isMounted && !fundamental) {
        setFundamental({ fk: '-', roe: '-', currentRatio: '-', debtToEquity: '-', sector: sectorName });
      }

      if (isMounted) setLoading(false);
    }

    fetchAll();
    return () => { isMounted = false };
  }, [slug, company]);

  if (loading || !companyStats) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`}>
        <div className="space-y-5 pb-8">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-[360px] w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </PublicPageLayout>
    )
  }

  const isUp = companyStats.diffPercent >= 0
  const logoFile = companyLogos[tickerUpper as keyof typeof companyLogos];
  const taAvailable = taData !== null;

  return (
    <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`}>
      <div className="space-y-5 pb-8 animate-in fade-in duration-400">

        {/* Back */}
        <Link to={`/sektorler/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          {sectorName}
        </Link>

        {/* Heading Card */}
        <div className="border border-border/40 bg-card/30 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {logoFile ? (
              <img src={`/logos/${logoFile}`} alt={tickerUpper} className="h-11 w-11 rounded-xl object-cover bg-white p-0 border border-border/30 shadow-3xs shrink-0" />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">{tickerUpper.slice(0, 2)}</div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">{tickerUpper}</span>
              <h1 className="text-base md:text-xl font-bold text-foreground tracking-tight leading-tight truncate mt-0.5">{companyStats.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight block leading-none">
                {companyStats.price > 0 ? companyStats.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
              </span>
              <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1.5 ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{companyStats.diffPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <TradingViewChart symbol={tickerUpper} lastPrice={companyStats.price} />

        {/* TEKNİK ANALİZ */}
        {taAvailable && taData && (
          <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/30">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Activity size={14} />
                </div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Teknik Analiz</h3>
              </div>
              <ScoreGauge score={taData.score} />
            </div>

            {/* Trend Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Günlük Trend', value: taData.trend, icon: <TrendingUp size={13} />, bull: taData.trend.toLowerCase().includes('bull') || taData.trend.toLowerCase().includes('yükseliş') },
                { label: 'Haftalık Trend', value: taData.weekly_trend, icon: <LineChart size={13} />, bull: taData.weekly_trend.toLowerCase().includes('bull') || taData.weekly_trend.toLowerCase().includes('yükseliş') },
                { label: 'Piyasa Rejimi', value: taData.market_regime.regime, icon: <Gauge size={13} />, bull: null },
                { label: 'Güven Seviyesi', value: taData.confidence, icon: <Shield size={13} />, bull: null },
              ].map((item) => (
                <div key={item.label} className="p-3.5 border border-border/40 rounded-xl bg-muted/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${item.bull === true ? 'text-emerald-500' : item.bull === false ? 'text-destructive' : 'text-foreground'}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Left: Indicators */}
              <div className="border border-border/40 rounded-xl bg-muted/10 overflow-hidden divide-y divide-border/20">
                {[
                  { label: 'RSI (14)', value: `${taData.rsi.value.toFixed(1)} — ${taData.rsi.status}`, icon: <BarChart3 size={12} /> },
                  { label: 'MACD', value: taData.macd, icon: <Activity size={12} /> },
                  { label: 'Bollinger', value: taData.bollinger_status, icon: <Target size={12} /> },
                  { label: 'SMA 20', value: `₺${taData.sma.sma_20.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: null },
                  { label: 'SMA 50', value: `₺${taData.sma.sma_50.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: null },
                  { label: 'SMA 200', value: `₺${taData.sma.sma_200.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: null },
                  { label: 'Destek', value: `₺${taData.support_resistance.support.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <Shield size={12} /> },
                  { label: 'Direnç', value: `₺${taData.support_resistance.resistance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <AlertTriangle size={12} /> },
                  { label: 'Stop-Loss (ATR)', value: `₺${taData.atr_stop_loss.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, icon: <Shield size={12} /> },
                  { label: 'Risk/Ödül', value: taData.rr_ratio.toFixed(2), icon: null },
                  { label: 'Beta', value: taData.beta.toFixed(2), icon: null },
                  { label: 'ADX', value: taData.market_regime.adx.toFixed(1), icon: null },
                  { label: 'Piyasa Genişliği', value: `${taData.market_breadth.breadth.toFixed(1)}% — ${taData.market_breadth.status}`, icon: null },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      {row.icon}
                      {row.label}
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Right: Score + Signals + Patterns */}
              <div className="space-y-4">

                {/* Score Components */}
                <div className="border border-border/40 rounded-xl bg-muted/10 p-4 space-y-3">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Skor Bileşenleri</span>
                  {[
                    { label: 'Trend', value: taData.score_components.trend, max: 50, color: 'bg-emerald-500' },
                    { label: 'Momentum', value: taData.score_components.momentum, max: 30, color: 'bg-blue-500' },
                    { label: 'Hacim', value: taData.score_components.volume, max: 20, color: 'bg-primary' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-[11px] mb-1.5">
                        <span className="text-muted-foreground font-semibold">{bar.label}</span>
                        <span className="text-foreground font-bold">{bar.value}/{bar.max}</span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${Math.min((bar.value / bar.max) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divergences */}
                <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2.5">Uyumsuzluklar</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'RSI Yükseliş', active: taData.divergences.rsi.bullish, color: 'text-emerald-500' },
                      { label: 'RSI Düşüş', active: taData.divergences.rsi.bearish, color: 'text-destructive' },
                      { label: 'MACD Yükseliş', active: taData.divergences.macd.bullish, color: 'text-emerald-500' },
                      { label: 'MACD Düşüş', active: taData.divergences.macd.bearish, color: 'text-destructive' },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-2.5 h-2.5 rounded-full ${d.active ? d.color : 'bg-muted/40'}`} />
                        <span className={`${d.active ? d.color : 'text-muted-foreground'} font-semibold`}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candlestick Patterns */}
                {taData.candlestick_patterns.length > 0 && (
                  <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5"><CandlestickChart size={11} /> Mum Formasyonları</span>
                    <div className="flex flex-wrap gap-1.5">
                      {taData.candlestick_patterns.map((p, i) => (
                        <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategy */}
                {taData.market_regime.recommended_strategy && (
                  <div className="border border-primary/20 rounded-xl bg-primary/5 p-4">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"><Zap size={11} /> Önerilen Strateji</span>
                    <p className="text-xs text-foreground/80 font-medium leading-relaxed">{taData.market_regime.recommended_strategy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Signals */}
            {taData.signals.length > 0 && (
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2.5">Aktif Sinyaller</span>
                <div className="flex flex-wrap gap-1.5">
                  {taData.signals.map((s, i) => (
                    <SignalBadge key={i} signal={s} />
                  ))}
                </div>
              </div>
            )}

            {/* TA Questions */}
            <div className="space-y-2.5 pt-2 border-t border-border/30">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                <HelpCircle size={11} />
                <span>Önerilen Teknik Analiz Soruları</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {technicalQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      if (window.innerWidth < 1024) window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                      await sendMessage(q, chatContext);
                    }}
                    className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TEMEL ANALİZ */}
        {fundamental && (
          <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Compass size={14} />
              </div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Temel Analiz Rasyoları</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Fiyat / Kazanç (F/K)', value: fundamental.fk, desc: 'P/E Ratio' },
                { label: 'Özsermaye Karlılığı', value: fundamental.roe, desc: 'ROE' },
                { label: 'Cari Oran', value: fundamental.currentRatio, desc: 'Current Ratio' },
                { label: 'Borç / Özsermaye', value: fundamental.debtToEquity, desc: 'D/E Ratio' },
              ].map((item) => (
                <div key={item.label} className="p-4 border border-border/40 rounded-xl bg-muted/10 flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">{item.desc}</span>
                  <span className="text-lg md:text-xl font-black text-foreground mt-2">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Fundamental Questions */}
            <div className="space-y-2.5 pt-2 border-t border-border/30">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                <HelpCircle size={11} />
                <span>Önerilen Temel Analiz Soruları</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {fundamentalQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      if (window.innerWidth < 1024) window.dispatchEvent(new CustomEvent('open-mobile-chat'));
                      await sendMessage(q, chatContext);
                    }}
                    className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/50 border border-border/30 hover:border-border/60 rounded-xl p-3 transition-colors cursor-pointer leading-normal active:scale-[0.99] font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </PublicPageLayout>
  )
}

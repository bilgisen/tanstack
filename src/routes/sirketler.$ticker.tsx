import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import companyNames from '../constants/companyNames.json'
import companyLogos from '../constants/companyLogos.json'
import { PublicPageLayout } from '../components/layout/PublicPageLayout'
import { useChatStore } from '../store/chat'

export const Route = createFileRoute('/sirketler/$ticker')({
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

function CompanyDetailPage() {
  const { ticker } = Route.useParams()
  const tickerUpper = ticker.toUpperCase()
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { sendMessage } = useChatStore()

  const chatContext = `sirket:${tickerUpper}`

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchCompanyDetails() {
      const apiUrl = import.meta.env.VITE_HONO_API_URL || "https://hono.paraanaliz.workers.dev";
      const officialName = (companyNames as Record<string, string>)[tickerUpper] || tickerUpper;
      let lastPrice = 0;
      let diffPercent = 0;
      let high = 0;
      let low = 0;
      let open = 0;
      let close = 0;
      let volume = '-';

      try {
        const res = await fetch(`${apiUrl}/api/market/symbol/${tickerUpper}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            lastPrice = typeof json.data.last_price === 'number' ? json.data.last_price : parseFloat(json.data.last_price) || 0;
            diffPercent = typeof json.data.diff_percent === 'number' ? json.data.diff_percent : parseFloat(json.data.diff_percent) || 0;
          }
        }
      } catch (e) {
        console.error('Company detail: symbol fetch failed', e);
      }

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
      } catch (e) {
        console.error('Company detail: summary-card fetch failed', e);
      }

      if (isMounted) {
        setCompanyStats({
          name: officialName,
          code: tickerUpper,
          price: lastPrice,
          diffPercent,
          high,
          low,
          open,
          close,
          volume,
        });
        setLoading(false);
      }
    }

    fetchCompanyDetails();
    return () => { isMounted = false };
  }, [ticker]);

  if (loading || !companyStats) {
    return (
      <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`}>
        <div className="flex h-[360px] items-center justify-center text-muted-foreground font-medium text-xs gap-2 animate-pulse">
          <Loader2 className="animate-spin text-primary" size={16} />
          <span>Veriler yükleniyor, lütfen bekleyin...</span>
        </div>
      </PublicPageLayout>
    )
  }

  const isUp = companyStats.diffPercent >= 0
  const logoFile = companyLogos[tickerUpper as keyof typeof companyLogos];

  return (
    <PublicPageLayout context={chatContext} placeholder={`${tickerUpper} hakkında bir soru sorun...`}>
      <div className="space-y-5 pb-8 animate-in fade-in duration-400">

        {/* Back */}
        <Link to="/sirketler" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          Şirketlere Dön
        </Link>

        {/* Heading Card */}
        <div className="border border-border/40 bg-card/30 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {logoFile ? (
              <img
                src={`/logos/${logoFile}`}
                alt={tickerUpper}
                className="h-11 w-11 rounded-xl object-contain bg-white p-1.5 border border-border/30 shadow-3xs shrink-0"
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {tickerUpper.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">{tickerUpper}</span>
              <h1 className="text-base md:text-xl font-bold text-foreground tracking-tight leading-tight truncate mt-0.5">{companyStats.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight block leading-none">
                {companyStats.price > 0
                  ? companyStats.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '-'}
              </span>
              <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1.5 ${
                isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
              }`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{companyStats.diffPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </PublicPageLayout>
  )
}

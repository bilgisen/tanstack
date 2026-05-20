import { AlertTriangle, TrendingUp, TrendingDown, Zap } from "lucide-react";

type FeedItem = {
  id: string;
  ticker: string;
  type: 'danger' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
};

const mockFeed: FeedItem[] = [
  {
    id: "1",
    ticker: "SASA",
    type: "danger",
    title: "Kritik Destek Kırılımı",
    description: "200 Günlük Hareketli Ortalama (GMA) aşağı yönlü kırıldı. Satış baskısı artabilir.",
    time: "5 dk önce"
  },
  {
    id: "2",
    ticker: "THYAO",
    type: "success",
    title: "Hacim Patlaması & RSI Sinyali",
    description: "Son 1 saatte ortalama hacmin 3 katı işlem gerçekleşti. RSI 68 seviyesinde güçlü alıma işaret ediyor.",
    time: "12 dk önce"
  },
  {
    id: "3",
    ticker: "TUPRS",
    type: "warning",
    title: "Sıkışma Formasyonu",
    description: "Bollinger bantları son 3 ayın en dar seviyesine ulaştı. Yakında sert bir kırılım beklenebilir.",
    time: "45 dk önce"
  }
];

export function PriorityFeed() {
  const getIcon = (type: FeedItem['type']) => {
    switch(type) {
      case 'danger': return <TrendingDown className="w-5 h-5 text-rose-500" />;
      case 'success': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Zap className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: FeedItem['type']) => {
    switch(type) {
      case 'danger': return "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
      case 'success': return "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
      case 'warning': return "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
      case 'info': return "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1c23] rounded-2xl border border-zinc-800/50 overflow-hidden">
      <div className="p-4 border-b border-zinc-800/50 bg-[#1a1c23] sticky top-0 z-10 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500" fill="currentColor" />
          AI Sinyalleri (Priority Feed)
        </h3>
        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full animate-pulse">
          Canlı
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {mockFeed.map(item => (
          <div 
            key={item.id} 
            className={`p-4 rounded-xl bg-[#22252d] border ${getBorderColor(item.type)} transition-all hover:-translate-y-0.5 cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-100">{item.ticker}</span>
                <span className="text-xs text-zinc-500">• {item.time}</span>
              </div>
              {getIcon(item.type)}
            </div>
            <h4 className="font-medium text-sm text-zinc-200 mb-1">{item.title}</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

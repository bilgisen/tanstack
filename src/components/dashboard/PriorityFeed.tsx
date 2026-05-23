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
      case 'danger': return <TrendingDown className="w-5 h-5 text-destructive" />;
      case 'success': return <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Zap className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getBorderColor = (type: FeedItem['type']) => {
    switch(type) {
      case 'danger': return "border-destructive/30 hover:border-destructive/50 shadow-2xs";
      case 'success': return "border-teal-500/30 hover:border-teal-500/50 shadow-2xs";
      case 'warning': return "border-amber-500/30 hover:border-amber-500/50 shadow-2xs";
      case 'info': return "border-indigo-500/30 hover:border-indigo-500/50 shadow-2xs";
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-card sticky top-0 z-10 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" fill="currentColor" />
          AI Sinyalleri (Priority Feed)
        </h3>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
          Canlı
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {mockFeed.map(item => (
          <div 
            key={item.id} 
            className={`p-4 rounded-xl bg-muted/30 border ${getBorderColor(item.type)} transition-all hover:-translate-y-0.5 cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{item.ticker}</span>
                <span className="text-xs text-muted-foreground">• {item.time}</span>
              </div>
              {getIcon(item.type)}
            </div>
            <h4 className="font-semibold text-sm text-foreground mb-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

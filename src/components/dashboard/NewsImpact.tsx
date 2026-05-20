import { Newspaper, ArrowUp, ArrowDown, Minus } from "lucide-react";

const mockNews = [
  {
    id: "1",
    ticker: "BIMAS",
    headline: "BİM 3. Çeyrek net kârı beklentileri aştı, %15 büyüme kaydetti.",
    impact: "positive",
    source: "Bloomberg HT",
    time: "2 saat önce"
  },
  {
    id: "2",
    ticker: "TCELL",
    headline: "Turkcell'in yeni yatırım planı piyasada soru işaretleri yarattı.",
    impact: "negative",
    source: "Reuters",
    time: "4 saat önce"
  },
  {
    id: "3",
    ticker: "AKBNK",
    headline: "Akbank sendikasyon kredisini %100'ün üzerinde yeniledi.",
    impact: "positive",
    source: "KAP",
    time: "5 saat önce"
  },
  {
    id: "4",
    ticker: "EREGL",
    headline: "Çelik fiyatlarındaki dalgalanma bilançoyu yatay etkiledi.",
    impact: "neutral",
    source: "Matriks",
    time: "1 gün önce"
  }
];

export function NewsImpact() {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive": return <ArrowUp className="w-5 h-5 text-emerald-500 bg-emerald-500/10 p-0.5 rounded-full" />;
      case "negative": return <ArrowDown className="w-5 h-5 text-rose-500 bg-rose-500/10 p-0.5 rounded-full" />;
      default: return <Minus className="w-5 h-5 text-zinc-500 bg-zinc-500/10 p-0.5 rounded-full" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1c23] rounded-2xl border border-zinc-800/50 overflow-hidden">
      <div className="p-4 border-b border-zinc-800/50 bg-[#1a1c23] flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-zinc-400" />
          Haber Etki Analizi
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {mockNews.map((news) => (
          <div key={news.id} className="flex gap-4 p-3 rounded-xl hover:bg-[#22252d] transition-colors cursor-pointer group">
            <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
              {getImpactIcon(news.impact)}
              <span className="text-[10px] font-bold text-zinc-500">{news.ticker}</span>
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors leading-snug">
                {news.headline}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500 font-medium">{news.source}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-xs text-zinc-600">{news.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

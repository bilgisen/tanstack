import { Grid } from "lucide-react";

const mockSectors = [
  { name: "Bankacılık", weight: 35, change: 1.2 },
  { name: "Sınai", weight: 25, change: -0.8 },
  { name: "Hizmetler", weight: 15, change: 0.5 },
  { name: "Teknoloji", weight: 10, change: 2.4 },
  { name: "Holding", weight: 8, change: -0.2 },
  { name: "Ulaştırma", weight: 7, change: 1.8 },
];

export function SectorHeatmap() {
  const getColor = (change: number) => {
    if (change > 2) return "bg-emerald-500 text-white";
    if (change > 0) return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30";
    if (change < -2) return "bg-rose-500 text-white";
    if (change < 0) return "bg-rose-500/20 text-rose-500 border border-rose-500/30";
    return "bg-zinc-800 text-zinc-300";
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1c23] rounded-2xl border border-zinc-800/50 overflow-hidden">
      <div className="p-4 border-b border-zinc-800/50 bg-[#1a1c23] flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
          <Grid className="w-4 h-4 text-zinc-400" />
          Sektör Isı Haritası
        </h3>
        <span className="text-xs text-zinc-500">BIST 100</span>
      </div>
      
      <div className="flex-1 p-4 flex flex-wrap gap-2 content-start overflow-y-auto scrollbar-hide">
        {mockSectors.map((sector, idx) => (
          <div 
            key={idx}
            className={`flex flex-col justify-between p-3 rounded-xl transition-all cursor-pointer hover:brightness-110 ${getColor(sector.change)}`}
            style={{ 
              flexBasis: \`calc(\${sector.weight}% - 8px)\`, 
              flexGrow: 1,
              minWidth: '100px',
              minHeight: \`\${Math.max(80, sector.weight * 3)}px\` 
            }}
            title={\`\${sector.name}: \${sector.change > 0 ? '+' : ''}\${sector.change}%\`}
          >
            <span className="font-medium text-sm truncate">{sector.name}</span>
            <span className="font-bold text-lg">
              {sector.change > 0 ? '+' : ''}{sector.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

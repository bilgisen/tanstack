import { useState, useMemo } from "react";
import { 
  ArrowRightLeft, 
  TrendingUp, 
  Coins, 
  Calculator, 
  ArrowUpRight, 
  Info
} from "lucide-react";

interface ComparisonCompany {
  name: string;
  price?: string;
  fk?: string;
  pddd?: string;
  roe?: string;
  health?: string;
}

interface RatioData {
  name: string;
  companyValue: number;
  sectorMedian: number;
}

export interface InteractiveWidgetProps {
  widget?: {
    type: 'comparison' | 'ratio_chart' | 'calculator';
    title: string;
    data: {
      companies?: ComparisonCompany[];
      company?: string;
      sector?: string;
      ratios?: RatioData[];
      principal?: number;
      rate?: number;
      years?: number;
      monthlyContribution?: number;
      label?: string;
    };
  } | null;
}

// Helper to format price values to use "₺" prefix instead of "TL" suffix
const formatPrice = (priceStr?: string) => {
  if (!priceStr) return "—";
  let clean = priceStr.replace(/\s*TL/gi, "").trim();
  if (!clean.startsWith("₺")) {
    return `₺${clean}`;
  }
  return clean;
};

export function InteractiveWidget({ widget }: InteractiveWidgetProps) {
  if (!widget) return null;

  const { type, title, data } = widget;

  return (
    <div className="mt-4 border border-border/10 bg-card rounded-xl overflow-hidden shadow-xs">
      {/* Widget Header Banner */}
      <div className="px-5 py-3 border-b border-border/10 bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'comparison' && <ArrowRightLeft size={16} className="text-muted-foreground" />}
          {type === 'ratio_chart' && <TrendingUp size={16} className="text-muted-foreground" />}
          {type === 'calculator' && <Calculator size={16} className="text-muted-foreground" />}
          <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
        </div>
      </div>

      {/* Widget Body */}
      <div className="p-5">
        {type === 'comparison' && data.companies && (
          <ComparisonWidget companies={data.companies} />
        )}
        {type === 'ratio_chart' && data.ratios && (
          <RatioChartWidget 
            companyName={data.company || "Şirket"} 
            sectorName={data.sector || "Sektör"} 
            ratios={data.ratios} 
          />
        )}
        {type === 'calculator' && (
          <FinancialCalculatorWidget 
            initialPrincipal={data.principal || 10000} 
            initialRate={data.rate || 25} 
            initialYears={data.years || 5} 
            initialMonthly={data.monthlyContribution || 1000}
            label={data.label || "Yatırım Projeksiyonu"}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   1. COMPARISON WIDGET
   ============================================================================ */
function ComparisonWidget({ companies }: { companies: ComparisonCompany[] }) {
  // Parse numeric values helper for highlighting better metrics
  const parseNum = (str?: string) => {
    if (!str) return NaN;
    return parseFloat(str.replace(/[^0-9.-]/g, ""));
  };

  // Find optimal values across companies to color green
  const bestFkIdx = useMemo(() => {
    let minFk = Infinity;
    let bestIdx = -1;
    companies.forEach((c, idx) => {
      const val = parseNum(c.fk);
      if (!isNaN(val) && val > 0 && val < minFk) {
        minFk = val;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, [companies]);

  const bestPdddIdx = useMemo(() => {
    let minPddd = Infinity;
    let bestIdx = -1;
    companies.forEach((c, idx) => {
      const val = parseNum(c.pddd);
      if (!isNaN(val) && val > 0 && val < minPddd) {
        minPddd = val;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, [companies]);

  const bestRoeIdx = useMemo(() => {
    let maxRoe = -Infinity;
    let bestIdx = -1;
    companies.forEach((c, idx) => {
      const val = parseNum(c.roe);
      if (!isNaN(val) && val > maxRoe) {
        maxRoe = val;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, [companies]);

  const bestHealthIdx = useMemo(() => {
    let maxHealth = -Infinity;
    let bestIdx = -1;
    companies.forEach((c, idx) => {
      const val = parseNum(c.health);
      if (!isNaN(val) && val > maxHealth) {
        maxHealth = val;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, [companies]);

  return (
    <div className="overflow-x-auto rounded-xl border border-border/10 bg-card">
      <table className="w-full border-collapse text-left text-sm min-w-[320px]">
        <thead>
          <tr className="bg-muted/10 text-xs text-muted-foreground uppercase font-semibold tracking-wider border-b border-border/10">
            <th className="p-3">Hisse</th>
            {companies.map((c, idx) => (
              <th key={idx} className="p-3 text-center border-l border-border/10 font-bold text-foreground text-sm">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/10">
          {/* Price Row */}
          <tr>
            <td className="p-3 font-medium text-muted-foreground">Son Fiyat</td>
            {companies.map((c, idx) => (
              <td key={idx} className="p-3 text-center border-l border-border/10 font-medium text-foreground">
                {formatPrice(c.price)}
              </td>
            ))}
          </tr>
          
          {/* F/K Row */}
          <tr>
            <td className="p-3 font-medium text-muted-foreground flex items-center gap-1.5">
              F/K Oranı
              <span className="cursor-help" title="Fiyat / Kazanç Oranı ne kadar düşükse, hisse o kadar ucuz kabul edilir.">
                <Info size={13} className="text-muted-foreground/50" />
              </span>
            </td>
            {companies.map((c, idx) => {
              const isBest = idx === bestFkIdx;
              return (
                <td key={idx} className={`p-3 text-center border-l border-border/10 ${
                  isBest ? "text-emerald-500 font-semibold" : "text-foreground font-normal"
                }`}>
                  {c.fk || "—"}
                  {isBest && <span className="text-[10px] block text-emerald-500/80 font-medium">(Ucuz)</span>}
                </td>
              );
            })}
          </tr>

          {/* PD/DD Row */}
          <tr>
            <td className="p-3 font-medium text-muted-foreground flex items-center gap-1.5">
              PD/DD Oranı
              <span className="cursor-help" title="Piyasa Değeri / Defter Değeri. 1'e yakın değerler genellikle olumludur.">
                <Info size={13} className="text-muted-foreground/50" />
              </span>
            </td>
            {companies.map((c, idx) => {
              const isBest = idx === bestPdddIdx;
              return (
                <td key={idx} className={`p-3 text-center border-l border-border/10 ${
                  isBest ? "text-emerald-500 font-semibold" : "text-foreground font-normal"
                }`}>
                  {c.pddd || "—"}
                  {isBest && <span className="text-[10px] block text-emerald-500/80 font-medium">(İdeal)</span>}
                </td>
              );
            })}
          </tr>

          {/* ROE Row */}
          <tr>
            <td className="p-3 font-medium text-muted-foreground flex items-center gap-1.5">
              Özsermaye Kârlılığı (ROE)
              <span className="cursor-help" title="Şirketin özsermayesini ne oranda kârla çalıştırdığını gösterir. Yüksek olması tercih edilir.">
                <Info size={13} className="text-muted-foreground/50" />
              </span>
            </td>
            {companies.map((c, idx) => {
              const isBest = idx === bestRoeIdx;
              return (
                <td key={idx} className={`p-3 text-center border-l border-border/10 ${
                  isBest ? "text-emerald-500 font-semibold" : "text-foreground font-normal"
                }`}>
                  {c.roe || "—"}
                  {isBest && <span className="text-[10px] block text-emerald-500/80 font-medium">(Yüksek Kâr)</span>}
                </td>
              );
            })}
          </tr>

          {/* Financial Health Score Row */}
          <tr>
            <td className="p-3 font-medium text-muted-foreground flex items-center gap-1.5">
              Mali Sağlık Skoru
              <span className="cursor-help" title="100 üzerinden şirketin borçluluk, likidite ve büyüme rasyoları modellemesi.">
                <Info size={13} className="text-muted-foreground/50" />
              </span>
            </td>
            {companies.map((c, idx) => {
              const isBest = idx === bestHealthIdx;
              const hVal = parseNum(c.health);
              const scoreColor = isBest 
                ? "text-emerald-500" 
                : !isNaN(hVal) && hVal < 50 ? "text-destructive" : "text-amber-500";
              return (
                <td key={idx} className={`p-3 text-center border-l border-border/10 ${scoreColor} ${
                  isBest ? "font-semibold" : "font-normal"
                }`}>
                  {c.health ? `${c.health} / 100` : "—"}
                  {isBest && <span className="text-[10px] block text-emerald-500/80 font-medium">(En Güçlü)</span>}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================================
   2. RATIO CHART WIDGET
   ============================================================================ */
function RatioChartWidget({ companyName, sectorName, ratios }: { companyName: string; sectorName: string; ratios: RatioData[] }) {
  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex justify-end gap-4 text-xs text-muted-foreground font-medium select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span>{companyName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/35" />
          <span>{sectorName} Medyanı</span>
        </div>
      </div>

      {/* Ratios Bars Grid */}
      <div className="space-y-4">
        {ratios.map((r, idx) => {
          // Normalize percentages for visual safety
          const maxVal = Math.max(r.companyValue, r.sectorMedian, 1) * 1.15;
          const compPct = Math.min((r.companyValue / maxVal) * 100, 100);
          const sectPct = Math.min((r.sectorMedian / maxVal) * 100, 100);

          // Highlights
          const isBetter = r.name.includes("ROE") || r.name.includes("Kârlılık") || r.name.includes("Büyüme")
            ? r.companyValue > r.sectorMedian
            : r.companyValue < r.sectorMedian; // For PE, PB ratios lower is usually better

          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{r.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-md ${
                  isBetter ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"
                }`}>
                  {companyName}: {r.companyValue} vs {sectorName}: {r.sectorMedian}
                </span>
              </div>

              {/* Company & Sector Bars rendered elegantly */}
              <div className="space-y-1.5 bg-muted/5 border border-border/10 rounded-lg p-2.5">
                {/* Company Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-xs text-muted-foreground truncate">{companyName}</span>
                  <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${compPct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-foreground">{r.companyValue}</span>
                </div>
                {/* Sector Median Bar */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-xs text-muted-foreground truncate">Medyan</span>
                  <div className="flex-1 h-1.5 bg-muted/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-muted-foreground/30 rounded-full transition-all duration-500" 
                      style={{ width: `${sectPct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground">{r.sectorMedian}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   3. FINANCIAL CALCULATOR WIDGET (With interactive sliders)
   ============================================================================ */
interface CalculatorProps {
  initialPrincipal: number;
  initialRate: number;
  initialYears: number;
  initialMonthly: number;
  label: string;
}

function FinancialCalculatorWidget({ initialPrincipal, initialRate, initialYears, initialMonthly, label }: CalculatorProps) {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [rate, setRate] = useState(initialRate);
  const [years, setYears] = useState(initialYears);
  const [monthly, setMonthly] = useState(initialMonthly);

  // Dynamic compound interest calculation done on the fly
  const calculated = useMemo(() => {
    const P = principal;
    const M = monthly;
    const r = rate / 100;
    const t = years;

    // Monthly compound calculations
    const rMonthly = r / 12;
    const nPeriods = t * 12;

    let fv = P * Math.pow(1 + rMonthly, nPeriods);

    if (rMonthly > 0) {
      fv += M * ((Math.pow(1 + rMonthly, nPeriods) - 1) / rMonthly) * (1 + rMonthly);
    } else {
      fv += M * nPeriods;
    }

    const totalContributed = P + (M * nPeriods);
    const growthEarnings = Math.max(fv - totalContributed, 0);

    return {
      finalValue: fv,
      totalContributed,
      growthEarnings
    };
  }, [principal, rate, years, monthly]);

  const maxBarValue = calculated.finalValue;
  const contributedPct = (calculated.totalContributed / maxBarValue) * 100;
  const growthPct = (calculated.growthEarnings / maxBarValue) * 100;

  return (
    <div className="space-y-5">
      {/* Dynamic Sub-header label */}
      <div className="text-sm text-muted-foreground flex items-start gap-2 border border-border/10 p-3 rounded-xl bg-muted/5">
        <Info size={16} className="text-primary mt-0.5 shrink-0" />
        <span>{label} parametrelerini aşağıdan değiştirerek canlı hesaplama yapabilirsiniz.</span>
      </div>

      {/* Dynamic Interactive Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Slider 1: Principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Coins size={14} className="text-muted-foreground" /> 
              Başlangıç Anaparası
            </span>
            <span className="text-foreground font-semibold">₺{principal.toLocaleString("tr-TR")}</span>
          </div>
          <input 
            type="range" 
            min="1000" 
            max="100000" 
            step="1000"
            value={principal} 
            onChange={(e) => setPrincipal(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" 
          />
        </div>

        {/* Slider 2: Monthly additions */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-muted-foreground" /> 
              Aylık Tasarruf / Ekleme
            </span>
            <span className="text-foreground font-semibold">₺{monthly.toLocaleString("tr-TR")}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="25000" 
            step="250"
            value={monthly} 
            onChange={(e) => setMonthly(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" 
          />
        </div>

        {/* Slider 3: Growth Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <TrendingUp size={14} className="text-muted-foreground" /> 
              Yıllık Beklenen Getiri (Getiri Oranı)
            </span>
            <span className="text-foreground font-semibold">%{rate}</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="120" 
            step="1"
            value={rate} 
            onChange={(e) => setRate(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" 
          />
        </div>

        {/* Slider 4: Time horizon */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calculator size={14} className="text-muted-foreground" /> 
              Yatırım Süresi (Vade)
            </span>
            <span className="text-foreground font-semibold">{years} Yıl</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="15" 
            step="1"
            value={years} 
            onChange={(e) => setYears(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-primary" 
          />
        </div>
      </div>

      {/* Projection Output Results */}
      <div className="p-4 rounded-xl border border-border/10 bg-muted/5 grid grid-cols-3 gap-2 md:gap-4 divide-x divide-border/10">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Katkı</span>
          <span className="text-sm md:text-base font-semibold text-foreground mt-1">
            ₺{calculated.totalContributed.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex flex-col pl-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Getiri</span>
          <span className="text-sm md:text-base font-semibold text-emerald-500 mt-1">
            ₺{calculated.growthEarnings.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex flex-col pl-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Toplam</span>
          <span className="text-sm md:text-base font-semibold text-primary mt-1">
            ₺{calculated.finalValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Visual Projections Distribution Bar */}
      <div className="space-y-2">
        <div className="relative h-3 bg-muted/20 border border-border/10 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-muted-foreground/30 transition-all duration-300 cursor-help"
            style={{ width: `${contributedPct}%` }}
            title={`Toplam Katkı: %${contributedPct.toFixed(1)}`}
          />
          <div 
            className="h-full bg-emerald-500 transition-all duration-300 cursor-help"
            style={{ width: `${growthPct}%` }}
            title={`Getiri: %${growthPct.toFixed(1)}`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider select-none">
          <span>Katkı: %{contributedPct.toFixed(0)}</span>
          <span className="text-emerald-500">Getiri: %{growthPct.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

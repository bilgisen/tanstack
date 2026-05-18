export function Bottombar() {
  const dummyTickers = [
    { symbol: "USD/TRY", price: "34.52", change: "+0.12%", up: true },
    { symbol: "EUR/TRY", price: "38.10", change: "-0.05%", up: false },
    { symbol: "XU100", price: "10245.50", change: "+1.20%", up: true },
    { symbol: "BTC/USD", price: "64500.00", change: "+2.40%", up: true },
    { symbol: "XAU/USD", price: "2450.10", change: "-0.30%", up: false },
  ];

  return (
    <footer className="h-8 border-t border-zinc-800 bg-zinc-950 overflow-hidden flex items-center shrink-0">
      <div className="flex animate-marquee whitespace-nowrap px-4 text-xs">
        {/* We would duplicate this for seamless loop in a real marquee */}
        <div className="flex gap-8 items-center min-w-full justify-around pr-8">
          {dummyTickers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-medium text-zinc-400">{t.symbol}</span>
              <span className="text-zinc-200">{t.price}</span>
              <span className={t.up ? "text-emerald-500" : "text-rose-500"}>
                {t.change}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-8 items-center min-w-full justify-around pr-8">
          {dummyTickers.map((t, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-2">
              <span className="font-medium text-zinc-400">{t.symbol}</span>
              <span className="text-zinc-200">{t.price}</span>
              <span className={t.up ? "text-emerald-500" : "text-rose-500"}>
                {t.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

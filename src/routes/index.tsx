import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Piyasa Özeti</h1>
        <p className="text-sm text-zinc-400">SumoTerminal'e hoş geldiniz. Piyasaların genel görünümü.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placeholder Stat Cards */}
        {[
          { title: "BIST 100", value: "10,245.50", change: "+1.2%", up: true },
          { title: "USD/TRY", value: "34.52", change: "+0.1%", up: true },
          { title: "Bitcoin", value: "$64,500", change: "-0.5%", up: false },
          { title: "Ons Altın", value: "$2,450", change: "+0.3%", up: true },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-zinc-400 text-sm font-medium">{stat.title}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-zinc-100">{stat.value}</span>
              <span className={`text-sm font-medium ${stat.up ? "text-emerald-500" : "text-rose-500"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-zinc-500 font-medium">TradingView Chart (Placeholder)</span>
        </div>
        <div className="h-[400px] bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-zinc-500 font-medium">Son Haberler (Placeholder)</span>
        </div>
      </div>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { user, loading } = useAuth()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  if (loading) {
    return <div className="flex h-[70vh] items-center justify-center text-zinc-500">Yükleniyor...</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 px-4 animate-in fade-in duration-500">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Finansal Analizde <span className="text-emerald-500">Yeni Nesil</span> Dönem
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Yapay zeka destekli analizler, canlı veriler ve profesyonel araçlarla piyasaların nabzını tutun.
          </p>
        </div>
        <button 
          onClick={handleLogin}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 text-lg shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 active:scale-95"
        >
          Google ile Bağlan ve Keşfet
        </button>
      </div>
    )
  }

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

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { ArrowUp, ArrowDown } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

const tabs = ['Borsa', 'Forex', 'Emtia', 'Kripto']

const marketData = {
  Borsa: [
    { title: "BIST 30", value: "11.245,50", absChange: "+124,20", pctChange: "+1,20%", up: true },
    { title: "BIST 100", value: "10.245,50", absChange: "+112,50", pctChange: "+1,10%", up: true },
    { title: "BIST 500", value: "12.450,00", absChange: "+95,20", pctChange: "+0,80%", up: true },
    { title: "Banka", value: "14.320,10", absChange: "-45,30", pctChange: "-0,30%", up: false },
  ],
  Forex: [
    { title: "USD / TRY", value: "34,5210", absChange: "+0,0120", pctChange: "+0,03%", up: true },
    { title: "EUR / TRY", value: "37,4520", absChange: "+0,0240", pctChange: "+0,05%", up: true },
    { title: "EUR / USD", value: "1,0850", absChange: "-0,0012", pctChange: "-0,11%", up: false },
    { title: "DXY", value: "104,20", absChange: "+0,15", pctChange: "+0,14%", up: true },
  ],
  Emtia: [
    { title: "Ons Altın", value: "2.450,10", absChange: "+12,50", pctChange: "+0,51%", up: true },
    { title: "Brent Petrol", value: "82,40", absChange: "-1,20", pctChange: "-1,45%", up: false },
    { title: "Gümüş", value: "31,20", absChange: "+0,45", pctChange: "+1,45%", up: true },
    { title: "Paladyum", value: "980,50", absChange: "-5,20", pctChange: "-0,50%", up: false },
  ],
  Kripto: [
    { title: "Bitcoin", value: "$64.500", absChange: "+1.200", pctChange: "+1,90%", up: true },
    { title: "Ethereum", value: "$3.450", absChange: "+85", pctChange: "+2,50%", up: true },
    { title: "Ripple", value: "$0,52", absChange: "-0,01", pctChange: "-1,90%", up: false },
    { title: "Dogecoin", value: "$0,12", absChange: "+0,005", pctChange: "+4,10%", up: true },
  ]
}

const Sparkline = ({ up }: { up: boolean }) => {
  const color = up ? "#10b981" : "#f43f5e" 
  const pathData = up 
    ? "M 0 20 Q 5 15, 10 18 T 20 10 T 30 15 T 40 5 T 50 12 T 60 2"
    : "M 0 5 Q 5 10, 10 8 T 20 15 T 30 12 T 40 22 T 50 18 T 60 25"

  return (
    <svg className="w-full h-10 mt-1" viewBox="0 0 60 30" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${up ? 'up' : 'down'}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L 60 30 L 0 30 Z`}
        fill={`url(#gradient-${up ? 'up' : 'down'})`}
      />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IndexPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'Borsa'|'Forex'|'Emtia'|'Kripto'>('Borsa')

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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4 Market Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData[activeTab].map((stat, i) => (
          <div key={i} className="bg-[#1a1c23] hover:bg-[#22252d] border border-transparent hover:border-zinc-800 transition-colors rounded-2xl p-4 flex flex-col justify-between shadow-sm cursor-pointer group h-32 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-zinc-300 text-[15px] font-medium">{stat.title}</span>
              <div className="mt-auto">
                <span className="text-xl font-semibold text-zinc-100 tracking-tight block leading-none mb-1.5">{stat.value}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[12px] font-medium ${stat.up ? "text-emerald-500" : "text-rose-500"}`}>
                    ({stat.absChange})
                  </span>
                  <span className={`flex items-center text-[12px] font-medium ${stat.up ? "text-emerald-500" : "text-rose-500"}`}>
                    {stat.pctChange} {stat.up ? <ArrowUp size={12} className="ml-0.5" /> : <ArrowDown size={12} className="ml-0.5" />}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Sparkline anchored to bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline up={stat.up} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Below Cards */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-zinc-100 mb-4 mt-8">{activeTab} piyasası özeti</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-[#1a1c23] rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-50"></div>
            <span className="text-zinc-500 font-medium z-10">TradingView Chart (Yakında)</span>
          </div>
          <div className="h-[400px] bg-[#1a1c23] rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden">
            <span className="text-zinc-500 font-medium z-10">Son Haberler (Yakında)</span>
          </div>
        </div>
      </div>

    </div>
  )
}

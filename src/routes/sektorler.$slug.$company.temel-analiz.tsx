import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LockedSection } from '../components/company/LockedSection'
import { fetchCompanyData, type FundamentalData } from '../constants/companyShared'
import {
  Compass, TrendingUp, DollarSign,
  Sparkles, Lock, Shield, AlertTriangle,
} from 'lucide-react'

export const Route = createFileRoute('/sektorler/$slug/$company/temel-analiz')({
  component: FundamentalAnalysisPage,
})

function FundamentalAnalysisPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [fundamental, setFundamental] = useState<FundamentalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchCompanyData(tickerUpper, slug).then((data: any) => {
      if (isMounted) {
        setFundamental(data.fundamental)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [tickerUpper, slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-64 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* PUBLIC: Essential Fundamental Data */}
      {fundamental && (
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Compass size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Temel Analiz Rasyoları</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Fiyat / Kazanç (F/K)', value: fundamental.fk, desc: 'P/E Ratio', icon: <DollarSign size={12} /> },
              { label: 'Özsermaye Karlılığı', value: fundamental.roe, desc: 'ROE', icon: <TrendingUp size={12} /> },
              { label: 'Cari Oran', value: fundamental.currentRatio, desc: 'Current Ratio', icon: <Shield size={12} /> },
              { label: 'Borç / Özsermaye', value: fundamental.debtToEquity, desc: 'D/E Ratio', icon: <AlertTriangle size={12} /> },
            ].map((item) => (
              <div key={item.label} className="p-4 border border-border/40 rounded-xl bg-muted/10 flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-xs text-muted-foreground font-semibold uppercase">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground/60 font-medium mt-0.5">{item.desc}</span>
                <span className="text-xl md:text-2xl font-black text-foreground mt-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS ONLY: Advanced Fundamental */}
      <LockedSection variant="anonymous" title="Gelişmiş Temel Analiz" description="Detaylı temel analiz ve AI yorumlarına erişmek için giriş yapın.">
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Gelişmiş Temel Analiz</h3>
            <Lock size={12} className="text-muted-foreground ml-auto" />
          </div>
          <div className="border border-primary/20 rounded-xl bg-primary/5 p-4">
            <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} /> AI Temel Analiz Özeti
            </span>
            <p className="text-sm text-foreground/80 font-medium leading-relaxed">
              AI destekli temel analiz özeti burada görünecek. Sektör karşılaştırmalı oran analizi, büyüme trendleri ve değerleme değerlendirmesi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Sektör Karşılaştırma</span>
              <p className="text-sm text-muted-foreground">Şirket oranları ile sektör medyan karşılaştırması ve yüzdelik sıralaması</p>
            </div>
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Trend Analizi</span>
              <p className="text-sm text-muted-foreground">Son 8 dönem finansal oran trendleri ve değişim hızları</p>
            </div>
          </div>
        </div>
      </LockedSection>

      {/* SUBSCRIBER ONLY: Premium Fundamental */}
      <LockedSection variant="subscriber" title="Premium Temel Analiz" description="Bu içeriğe erişmek için yükseltme yapın.">
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/30">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Premium Temel Analiz</h3>
            <Lock size={12} className="text-muted-foreground ml-auto" />
          </div>
          <div className="border border-amber-500/20 rounded-xl bg-amber-500/5 p-4">
            <span className="text-xs text-amber-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} /> AI Detaylı Temel Analiz
            </span>
            <p className="text-sm text-foreground/80 font-medium leading-relaxed">
              AI destekli detaylı temel analiz raporu. DCF değerleme, senaryo analizi, finansal sağlık skoru ve gelecek büyüme projeksiyonları.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Likidite Analizi</span>
              <p className="text-sm text-muted-foreground">Cari oran, hızlı oran, nakit akış analizi</p>
            </div>
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Karlılık Analizi</span>
              <p className="text-sm text-muted-foreground">ROE, ROA, net marj, brüt marj trendleri</p>
            </div>
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Büyüme Analizi</span>
              <p className="text-sm text-muted-foreground">Gelir büyümesi, kâr büyümesi, bileşik büyüme oranı</p>
            </div>
          </div>
        </div>
      </LockedSection>

    </div>
  )
}

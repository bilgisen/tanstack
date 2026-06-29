import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LockedSection } from '../components/company/LockedSection'
import { fetchCompanyData, type FundamentalData } from '../constants/companyShared'
import {
  Compass, TrendingUp, DollarSign,
  Sparkles, Lock, Shield, AlertTriangle,
} from 'lucide-react'
import { 
  FundamentalAnalysisWidget,
  useFundamentalAnalysis,
  type UserTier 
} from '../components/fundamental'
import { useAuth } from '../hooks/useAuth'
import { TIER_CONFIG, type Tier } from '../lib/tiers'

export const Route = createFileRoute('/sektorler/$slug/$company/temel-analiz')({
  component: FundamentalAnalysisPage,
})

// Map app tiers to FA tiers
function mapTierToFA(tier: Tier | null): UserTier {
  if (!tier) return 'anonymous'
  if (tier === 'ultimate' || tier === 'pro') return 'subscriber'
  if (tier === 'standard' || tier === 'free') return 'member'
  return 'anonymous'
}

// Get user tier from auth
function getUserTierFromAuth(user: any): UserTier {
  if (!user) return 'anonymous'
  const userTier = user.tier as Tier | null
  return mapTierToFA(userTier)
}

function FundamentalAnalysisPage() {
  const { slug, company } = Route.useParams()
  const tickerUpper = company.toUpperCase()
  const [fundamental, setFundamental] = useState<FundamentalData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Get user from auth
  const { user, loading: authLoading } = useAuth()
  const userTier = getUserTierFromAuth(user)

  // AI Analysis data
  const { data: aiData, loading: aiLoading, error: aiError } = useFundamentalAnalysis(tickerUpper, userTier)

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

      {/* AI Analysis - Temel Analiz Puanı */}
      {userTier !== 'anonymous' && !aiLoading && aiData && (
        <div className="border border-border/45 bg-card/20 rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/30 mb-5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Temel Analiz Puanı</h3>
          </div>
          <FundamentalAnalysisWidget 
            ticker={tickerUpper} 
            tier={userTier}
            onUpgrade={() => {
              // TODO: Navigate to upgrade page
              console.log('Upgrade clicked')
            }}
          />
        </div>
      )}

      {/* MEMBERS ONLY: Advanced Fundamental with AI Analysis */}
      <LockedSection variant="anonymous" title="Gelişmiş Temel Analiz" description="Detaylı temel analiz ve AI yorumlarına erişmek için giriş yapın.">
        {aiLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted/30 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-muted/30 rounded-lg" />
              <div className="h-24 bg-muted/30 rounded-lg" />
              <div className="h-24 bg-muted/30 rounded-lg" />
            </div>
          </div>
        ) : aiError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-500 text-sm">AI analiz verileri yüklenemedi: {aiError}</p>
          </div>
        ) : aiData && userTier !== 'anonymous' ? (
          /* Actual AI Analysis Content for Members */
          <div className="space-y-5">
            {/* Score Card Section */}
            {aiData.cards?.find((c: any) => c.type === 'score_card') && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 p-4 border border-border/40 rounded-xl bg-muted/10">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">
                    Toplam Puan
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">
                      {aiData.cards.find((c: any) => c.type === 'score_card').data.score_sektor?.toFixed(1) || '-'}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Sektör: #{aiData.cards.find((c: any) => c.type === 'score_card').data.rank_sector || '-'}
                  </div>
                </div>
                
                {/* Pillar Scores */}
                {['karlilik', 'finansal', 'verimlilik'].map((pillar) => {
                  const score = aiData.cards.find((c: any) => c.type === 'score_card')?.data[`score_${pillar}`]
                  return (
                    <div key={pillar} className="p-4 border border-border/40 rounded-xl bg-muted/10">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">
                        {pillar === 'karlilik' ? 'Kârlılık' : pillar === 'finansal' ? 'Finansal' : 'Verimlilik'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-foreground">
                          {score?.toFixed(0) || '-'}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${score || 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* AI Analysis Summary */}
            {aiData.summary && (
              <div className="border border-primary/20 rounded-xl bg-primary/5 p-4">
                <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} /> AI Temel Analiz Özeti
                </span>
                <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                  {aiData.summary.summary}
                </p>
                {aiData.summary.key_strengths && aiData.summary.key_strengths.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {aiData.summary.key_strengths.map((s: string, i: number) => (
                      <span key={i} className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sector Position */}
            {aiData.cards?.find((c: any) => c.type === 'sector_position') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">
                    Sektör Karşılaştırma
                  </span>
                  <div className="text-sm text-foreground">
                    {aiData.cards.find((c: any) => c.type === 'sector_position').data.above_median_ratios?.length || 0} rasyo sektör üstü,
                    {' '}{aiData.cards.find((c: any) => c.type === 'sector_position').data.below_median_ratios?.length || 0} rasyo sektör altı
                  </div>
                </div>
                <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">
                    Trend Analizi
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Son dönem finansal oran trendleri ve değişim hızları
                  </p>
                </div>
              </div>
            )}

            {/* Ratio Cards Grid */}
            {aiData.cards?.filter((c: any) => c.type === 'ratio_comparison').length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {aiData.cards
                  .filter((c: any) => c.type === 'ratio_comparison')
                  .slice(0, 8)
                  .map((card: any, i: number) => (
                    <div key={i} className="p-3 border border-border/40 rounded-xl bg-muted/10">
                      <span className="text-xs text-muted-foreground font-semibold block mb-1">
                        {card.data.ratio_name}
                      </span>
                      <span className="text-lg font-black text-foreground">
                        {card.data.company_value?.toFixed(2) || '-'}
                      </span>
                      {card.data.sector_median && (
                        <span className="text-xs text-muted-foreground block mt-1">
                          Sektör: {card.data.sector_median.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          /* Placeholder for non-logged users */
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
        )}
      </LockedSection>

      {/* SUBSCRIBER ONLY: Premium Fundamental with Detailed Report */}
      <LockedSection variant="subscriber" title="Premium Temel Analiz" description="Bu içeriğe erişmek için yükseltme yapın.">
        {userTier === 'subscriber' && aiData?.detailed_report ? (
          /* Actual Premium Content for Subscribers */
          <div className="space-y-5">
            {/* Detailed Report */}
            <div className="border border-amber-500/20 rounded-xl bg-amber-500/5 p-4">
              <span className="text-xs text-amber-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} /> AI Detaylı Temel Analiz Raporu
              </span>
              
              {/* Executive Summary */}
              <div className="mt-3 text-sm text-foreground/80 leading-relaxed">
                <strong className="text-foreground">Yönetici Özeti:</strong>
                <p className="mt-1">{aiData.detailed_report.executive_summary}</p>
              </div>
            </div>

            {/* Analysis Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Finansal Durum</span>
                <p className="text-sm text-foreground/70">{aiData.detailed_report.financial_position}</p>
              </div>
              <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Kârlılık Analizi</span>
                <p className="text-sm text-foreground/70">{aiData.detailed_report.profitability_analysis}</p>
              </div>
              <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Sektör Karşılaştırma</span>
                <p className="text-sm text-foreground/70">{aiData.detailed_report.sector_comparison}</p>
              </div>
            </div>

            {/* Catalysts & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-500/20 rounded-xl bg-green-500/5 p-4">
                <span className="text-xs text-green-500 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <TrendingUp size={12} /> Katalizörler
                </span>
                <ul className="text-sm text-foreground/70 space-y-1">
                  {aiData.detailed_report.catalysts?.slice(0, 3).map((c: string, i: number) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-red-500/20 rounded-xl bg-red-500/5 p-4">
                <span className="text-xs text-red-500 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> Riskler
                </span>
                <ul className="text-sm text-foreground/70 space-y-1">
                  {aiData.detailed_report.risks?.slice(0, 3).map((r: string, i: number) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SWOT Card */}
            {aiData.cards?.find((c: any) => c.type === 'swot') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-green-500/20 rounded-xl bg-green-500/5 p-4">
                  <span className="text-xs text-green-500 font-bold uppercase tracking-wider block mb-2">Güçlü Yönler</span>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    {aiData.cards.find((c: any) => c.type === 'swot').data.strengths?.slice(0, 3).map((s: any, i: number) => (
                      <li key={i}>• {s.item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-red-500/20 rounded-xl bg-red-500/5 p-4">
                  <span className="text-xs text-red-500 font-bold uppercase tracking-wider block mb-2">Zayıf Yönler</span>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    {aiData.cards.find((c: any) => c.type === 'swot').data.weaknesses?.slice(0, 3).map((w: any, i: number) => (
                      <li key={i}>• {w.item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-blue-500/20 rounded-xl bg-blue-500/5 p-4">
                  <span className="text-xs text-blue-500 font-bold uppercase tracking-wider block mb-2">Fırsatlar</span>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    {aiData.cards.find((c: any) => c.type === 'swot').data.opportunities?.slice(0, 3).map((o: any, i: number) => (
                      <li key={i}>• {o.item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-yellow-500/20 rounded-xl bg-yellow-500/5 p-4">
                  <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider block mb-2">Tehditler</span>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    {aiData.cards.find((c: any) => c.type === 'swot').data.threats?.slice(0, 3).map((t: any, i: number) => (
                      <li key={i}>• {t.item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Conclusion */}
            <div className="border border-border/40 rounded-xl bg-muted/10 p-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Sonuç</span>
              <p className="text-sm text-foreground/80">{aiData.detailed_report.conclusion}</p>
              <p className="text-xs text-muted-foreground mt-3 italic">{aiData.detailed_report.disclaimer}</p>
            </div>
          </div>
        ) : (
          /* Placeholder for non-subscribers */
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
        )}
      </LockedSection>

    </div>
  )
}

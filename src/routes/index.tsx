import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Globe, 
  Bell, 
  ShieldAlert, 
  Check, 
  X, 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  HelpCircle
} from 'lucide-react'
import { Logo } from '../components/layout/Logo'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

// Inject premium animations for the Nebula backdrop
const nebulaStyles = `
@keyframes pulseGlow {
  0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.4; }
  33% { transform: scale(1.25) translate(30px, -20px); opacity: 0.6; }
  66% { transform: scale(0.85) translate(-20px, 30px); opacity: 0.45; }
}
@keyframes starBlink {
  0%, 100% { opacity: 0.15; transform: scale(0.75); }
  50% { opacity: 0.85; transform: scale(1.3); }
}
.animate-pulse-glow-1 {
  animation: pulseGlow 18s ease-in-out infinite;
}
.animate-pulse-glow-2 {
  animation: pulseGlow 24s ease-in-out infinite alternate;
}
.animate-pulse-glow-3 {
  animation: pulseGlow 28s ease-in-out infinite;
}
.animate-star-blink {
  animation: starBlink 3s ease-in-out infinite;
}
`

function LandingPage() {
  const { user, loading, login: handleLogin } = useAuth()
  const navigate = useNavigate()

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // Redirection handled dynamically in page buttons to prevent flashes/refreshes on load

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-muted-foreground animate-pulse font-sans">
        Yükleniyor...
      </div>
    )
  }

  // Predefined star coordinates for Nebula backdrop
  const stars = [
    { top: '12%', left: '8%', delay: '0s', size: '2px' },
    { top: '24%', left: '85%', delay: '1s', size: '3px' },
    { top: '35%', left: '15%', delay: '0.5s', size: '1px' },
    { top: '48%', left: '72%', delay: '1.8s', size: '2px' },
    { top: '18%', left: '50%', delay: '2.2s', size: '2.5px' },
    { top: '60%', left: '5%', delay: '0.3s', size: '3px' },
    { top: '72%', left: '92%', delay: '1.2s', size: '1.5px' },
    { top: '85%', left: '22%', delay: '2s', size: '2px' },
    { top: '92%', left: '60%', delay: '0.7s', size: '3px' },
    { top: '40%', left: '40%', delay: '1.5s', size: '1.5px' },
    { top: '65%', left: '78%', delay: '2.5s', size: '2px' },
    { top: '55%', left: '55%', delay: '1s', size: '1px' },
  ]

  return (
    <div className="relative min-h-screen text-foreground select-none overflow-x-hidden font-sans pb-16">
      <style dangerouslySetInnerHTML={{ __html: nebulaStyles }} />

      {/* 🌌 Nebula Backdrop Container */}
      <div className="absolute inset-0 -z-10 bg-background transition-colors duration-500 overflow-hidden">
        
        {/* Glowing Nebula Layers (Dark/Light Responsive) */}
        {/* Layer 1: Deep Indigo/Rose Glow */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] pointer-events-none opacity-40 mix-blend-screen animate-pulse-glow-1"
          style={{
            background: 'radial-gradient(circle, oklch(0.42 0.16 312.0) 0%, transparent 70%)'
          }}
        />
        {/* Layer 2: Vivid Violet/Blue Glow */}
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] rounded-full blur-[130px] pointer-events-none opacity-35 mix-blend-screen animate-pulse-glow-2"
          style={{
            background: 'radial-gradient(circle, oklch(0.38 0.15 264.0) 0%, transparent 70%)'
          }}
        />
        {/* Layer 3: Warm Coral/Amber Ambient */}
        <div 
          className="absolute top-[35%] left-[30%] w-[50vw] h-[50vw] rounded-full blur-[140px] pointer-events-none opacity-20 mix-blend-screen animate-pulse-glow-3"
          style={{
            background: 'radial-gradient(circle, oklch(0.53 0.14 355.0) 0%, transparent 70%)'
          }}
        />

        {/* Delicate Star Particles */}
        <div className="absolute inset-0 opacity-40 dark:opacity-90">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-star-blink shadow-[0_0_8px_1px_rgba(255,255,255,0.8)]"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* 🚀 Main Hero Section (Slightly more padding top to account for absolute topbar) */}
      <section className="container mx-auto px-4 pt-28 pb-16 md:pt-36 md:pb-24 text-center max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Brand Logo (Clean & Simple) */}
        <div className="flex justify-center mb-10">
          <Logo size={48} className="text-primary" />
        </div>

        {/* Headline (Styled with Geist font weight: font-bold for bold premium elegance) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 text-foreground">
          Borsa uzmanı <br className="hidden md:inline" />
          yapay zeka asistanı
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed mb-10">
          Güvenilir ve zengin veri seti, gelişkin finansal analiz motoru ve yapay zekanın gücü.
        </p>

        {/* Google CTA Button Container */}
        <div className="flex flex-col items-center justify-center gap-4 mb-16">
          {user ? (
            <button
              onClick={() => navigate({ to: '/panel' })}
              className="group flex items-center justify-center gap-3.5 border border-primary text-primary hover:bg-primary/5 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:shadow-md hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>Hemen Panele Git</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="group flex items-center justify-center gap-3.5 border border-primary text-primary hover:bg-primary/5 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 hover:shadow-md hover:scale-102 active:scale-98 cursor-pointer"
            >
              {/* Google Logo Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Ücretsiz Deneyin</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          )}
          
          <span className="text-xs text-muted-foreground/80 font-medium tracking-wide">
            Kredi kartı gerekmez — hemen kullanmaya başla
          </span>
        </div>

        {/* 💻 Floating Minimalist Dashboard Mockup (Enriches the below-hero area with premium visual style) */}
        <div className="mb-16 relative max-w-4xl mx-auto rounded-3xl border border-border/60 bg-card/30 backdrop-blur-xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-1000 group text-left">
          
          {/* Neon Gradient Glow behind mockup */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-primary/10 via-fuchsia-500/10 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Grid: Left - Stock overview, Right - AI Chatbot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            
            {/* Left side: Stock chart preview */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-foreground">THYAO</span>
                  <span className="text-xs text-muted-foreground block font-light">Türk Hava Yolları AO</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground font-mono">312.50 TRY</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold font-mono block">+2.45%</span>
                </div>
              </div>

              {/* Simulated Vector Graph */}
              <div className="h-36 bg-muted/30 border border-border/30 rounded-2xl relative overflow-hidden flex items-center justify-center p-2">
                <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mockupChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 0 80 Q 25 75, 50 82 T 100 60 T 150 45 T 200 50 T 250 25 T 300 15 L 300 100 L 0 100 Z" 
                    fill="url(#mockupChartGradient)" 
                  />
                  <path 
                    d="M 0 80 Q 25 75, 50 82 T 100 60 T 150 45 T 200 50 T 250 25 T 300 15" 
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <circle cx="300" cy="15" r="4" fill="var(--primary)" className="animate-ping" />
                  <circle cx="300" cy="15" r="3" fill="var(--primary)" />
                </svg>
              </div>

              {/* Sektör Medyanı Mini Card */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-muted/20 border border-border/30 p-2.5 rounded-xl">
                  <span className="block text-[10px] text-muted-foreground/80 font-light mb-0.5">Şirket F/K</span>
                  <span className="font-bold text-foreground font-mono">5.24</span>
                </div>
                <div className="bg-muted/20 border border-border/30 p-2.5 rounded-xl">
                  <span className="block text-[10px] text-muted-foreground/80 font-light mb-0.5">Sektör Medyanı</span>
                  <span className="font-bold text-foreground font-mono">6.85</span>
                </div>
                <div className="bg-muted/20 border border-border/30 p-2.5 rounded-xl">
                  <span className="block text-[10px] text-muted-foreground/80 font-light mb-0.5">İskonto Oranı</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">%23.5</span>
                </div>
              </div>
            </div>

            {/* Right side: Assistant chatbot mockup */}
            <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6 space-y-4 text-left">
              <div className="space-y-3 flex-1">
                {/* Chat Bubble 1: User */}
                <div className="flex gap-2 items-start max-w-[90%]">
                  <div className="w-5 h-5 rounded-full bg-muted border border-border/60 flex items-center justify-center text-[9px] font-bold text-muted-foreground font-mono">U</div>
                  <div className="bg-muted/40 border border-border/30 px-3 py-2 rounded-2xl rounded-tl-none">
                    <p className="text-[11px] text-foreground font-light">THYAO son çeyrek rasyo ve trend durumu nedir?</p>
                  </div>
                </div>

                {/* Chat Bubble 2: AI */}
                <div className="flex gap-2 items-start max-w-[95%] ml-auto flex-row-reverse">
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-bold text-primary font-mono"><Sparkles size={9} /></div>
                  <div className="bg-primary/5 border border-primary/15 px-3 py-2.5 rounded-2xl rounded-tr-none shadow-2xs">
                    <p className="text-[11px] text-foreground font-light leading-relaxed">
                      <strong>THYAO</strong> son bilançosunda net kâr marjını <strong>%24 artırdı</strong>. 
                      F/K oranı 5.24 ile sektör medyanının altında iskontolu. 
                      Grafikte son 6 günde <strong>boğa momentumu</strong> gözleniyor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulated input bar */}
              <div className="flex items-center gap-2 bg-muted/30 border border-border/40 px-3 py-2 rounded-xl text-xs text-muted-foreground/60">
                <Sparkles size={12} className="text-primary animate-pulse" />
                <span className="flex-1 font-light">Analiz etmeye devam et...</span>
                <kbd className="bg-card border border-border/30 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Signals Band */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/80 font-semibold">
            <span className="text-primary text-base">✦</span> BIST verilerine özel eğitilmiş
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/80 font-semibold border-t sm:border-t-0 sm:border-x border-border/40 py-2 sm:py-0">
            <span className="text-primary text-base">✦</span> Python tabanlı analiz motoru
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/80 font-semibold">
            <span className="text-primary text-base">✦</span> Halüsinasyon değil, gerçek veri
          </div>
        </div>

      </section>

      {/* 📈 Social Proof Band */}
      <section className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-card/45 border border-border/60 rounded-2xl p-6 backdrop-blur-md shadow-2xs hover:bg-card/60 hover:border-border transition-all duration-300 relative group">
            <div className="text-primary text-3xl font-serif absolute top-2.5 left-4 opacity-30 select-none pointer-events-none font-black">“</div>
            <p className="text-sm text-foreground/90 italic leading-relaxed pt-3 mb-4">
              "Genel yapay zeka araçlarında hep veri doğruluğu sorunum vardı. HissePro'da gördüğüm rasyolar bilanço ile birebir örtüşüyor."
            </p>
            <div className="border-t border-border/45 pt-3">
              <span className="block text-xs font-bold text-foreground">Beta Kullanıcısı</span>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Bireysel Yatırımcı</span>
            </div>
          </div>

          <div className="bg-card/45 border border-border/60 rounded-2xl p-6 backdrop-blur-md shadow-2xs hover:bg-card/60 hover:border-border transition-all duration-300 relative group">
            <div className="text-primary text-3xl font-serif absolute top-2.5 left-4 opacity-30 select-none pointer-events-none font-black">“</div>
            <p className="text-sm text-foreground/90 italic leading-relaxed pt-3 mb-4">
              "Teknik formasyon uyarıları sayesinde pozisyona çok daha erken girdim."
            </p>
            <div className="border-t border-border/45 pt-3">
              <span className="block text-xs font-bold text-foreground">Beta Kullanıcısı</span>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Aktif Trader</span>
            </div>
          </div>

          <div className="bg-card/45 border border-border/60 rounded-2xl p-6 backdrop-blur-md shadow-2xs hover:bg-card/60 hover:border-border transition-all duration-300 relative group">
            <div className="text-primary text-3xl font-serif absolute top-2.5 left-4 opacity-30 select-none pointer-events-none font-black">“</div>
            <p className="text-sm text-foreground/90 italic leading-relaxed pt-3 mb-4">
              "Sektör medyan karşılaştırması özelliği analistlerin haftalarca yaptığı işi dakikalar içinde yapıyor."
            </p>
            <div className="border-t border-border/45 pt-3">
              <span className="block text-xs font-bold text-foreground">Beta Kullanıcısı</span>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Portföy Yöneticisi</span>
            </div>
          </div>

        </div>
      </section>

      {/* 📊 Positioning Bridge (Comparison Table) */}
      <section className="container mx-auto px-4 py-20 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Neden Ne İş Yatırım Ne de ChatGPT Yeterli?
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto" />
        </div>

        <div className="bg-card/60 border border-border/80 rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-bold">
                  <th className="px-6 py-4">Özellik</th>
                  <th className="px-6 py-4">Aracı Kurum Platformları</th>
                  <th className="px-6 py-4">Genel Yapay Zeka</th>
                  <th className="px-6 py-4 bg-primary/10 text-primary border-x border-primary/20 text-center font-extrabold">HissePro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                
                <tr>
                  <td className="px-6 py-4 font-semibold text-foreground/90">Güvenilir BIST verisi</td>
                  <td className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold"><Check size={18} /></td>
                  <td className="px-6 py-4 text-destructive font-bold"><X size={18} /></td>
                  <td className="px-6 py-4 bg-primary/5 border-x border-primary/10 text-center text-teal-600 dark:text-teal-400 font-bold flex justify-center"><Check size={18} /></td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-semibold text-foreground/90">Yapay zeka yorumu</td>
                  <td className="px-6 py-4 text-destructive font-bold"><X size={18} /></td>
                  <td className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold"><Check size={18} /></td>
                  <td className="px-6 py-4 bg-primary/5 border-x border-primary/10 text-center text-teal-600 dark:text-teal-400 font-bold flex justify-center"><Check size={18} /></td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-semibold text-foreground/90">BIST'e özel analiz motoru</td>
                  <td className="px-6 py-4 text-destructive font-bold"><X size={18} /></td>
                  <td className="px-6 py-4 text-destructive font-bold"><X size={18} /></td>
                  <td className="px-6 py-4 bg-primary/5 border-x border-primary/10 text-center text-teal-600 dark:text-teal-400 font-bold flex justify-center"><Check size={18} /></td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-semibold text-foreground/90">Hesaplanmış rasyolar & sektör medyanı</td>
                  <td className="px-6 py-4 text-muted-foreground font-semibold">Kısmi</td>
                  <td className="px-6 py-4 text-destructive font-bold"><X size={18} /></td>
                  <td className="px-6 py-4 bg-primary/5 border-x border-primary/10 text-center text-teal-600 dark:text-teal-400 font-bold flex justify-center"><Check size={18} /></td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-semibold text-foreground/90">Doğal dilde soru sorabilme</td>
                  <td className="px-6 py-4 text-destructive font-bold"><X size={18} /></td>
                  <td className="px-6 py-4 text-teal-600 dark:text-teal-400 font-bold"><Check size={18} /></td>
                  <td className="px-6 py-4 bg-primary/5 border-x border-primary/10 text-center text-teal-600 dark:text-teal-400 font-bold flex justify-center"><Check size={18} /></td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-semibold text-foreground/90">Halüsinasyon riski</td>
                  <td className="px-6 py-4 text-muted-foreground font-semibold">Düşük</td>
                  <td className="px-6 py-4 text-destructive font-extrabold text-red-500">Yüksek</td>
                  <td className="px-6 py-4 bg-primary/5 border-x border-primary/10 text-center text-muted-foreground font-semibold flex justify-center">Düşük</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ✨ Features Section */}
      <section className="container mx-auto px-4 py-20 max-w-6xl relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Bir Finansal Analistin Gücü, Bir Sohbetin Kolaylığı
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            BIST pazarını yakından izleyen, rasyoları saniyeler içinde hesaplayan ve trend değişimlerini grafiklerle size sunan yapay zeka araçları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Feature 1 */}
          <div className="bg-card/50 border border-border/60 hover:border-primary/30 rounded-2xl p-6 shadow-2xs hover:shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 size={20} />
              </div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-1">Temel Analiz Motoru</span>
              <h3 className="text-lg font-bold text-foreground mb-3">Mali Tablolardan Anlam Çıkar</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Onlarca finansal rasyo otomatik hesaplanır, sektör medyanlarıyla karşılaştırılır. Şirketin trendi, momentumu ve sektör içindeki konumu tek bakışta görünür. F/K'ya bakmak yetmez — biz size F/K'nın <em>ne anlama geldiğini</em> söyleriz.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-card/50 border border-border/60 hover:border-primary/30 rounded-2xl p-6 shadow-2xs hover:shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-1">Teknik Analiz Motoru</span>
              <h3 className="text-lg font-bold text-foreground mb-3">Formasyonlar Oluşmadan Önce Hazır Ol</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Python tabanlı motorumuz grafikleri sürekli tarar. Destek/direnç kırılmaları, formasyon tamamlanmaları, momentum değişimleri — siz sormadan önce sistem sizi uyarır.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-card/50 border border-border/60 hover:border-primary/30 rounded-2xl p-6 shadow-2xs hover:shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare size={20} />
              </div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-1">BIST Chatbot</span>
              <h3 className="text-lg font-bold text-foreground mb-3">Doğru Soruyu Sor, Doğru Cevabı Al</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                "THYAO'nun son iki çeyrekteki marj trendi nasıl?" veya "Havacılık sektöründe en güçlü bilançoya sahip şirket hangisi?" — cevaplar tablo, grafik ve AI yorumuyla gelir. Veri uydurulmaz, hesaplanır.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-card/50 border border-border/60 hover:border-primary/30 rounded-2xl p-6 shadow-2xs hover:shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe size={20} />
              </div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-1">Sektör Analizi</span>
              <h3 className="text-lg font-bold text-foreground mb-3">Ağacı Değil Ormanı Gör</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Tek bir sektörün tüm şirketlerini rasyo bazında sıralayın, karşılaştırın. Hangi şirket sektörünün gerisinde, hangisi öne geçiyor — anında görün.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-card/50 border border-border/60 hover:border-primary/30 rounded-2xl p-6 shadow-2xs hover:shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bell size={20} />
              </div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-1">Haber & KAP Takibi</span>
              <h3 className="text-lg font-bold text-foreground mb-3">Kritik Bildirimleri Kaçırma</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                KAP açıklamaları ve piyasa haberleri, AI tarafından özetlenir ve yorumlanır. "Bu açıklama hisse için ne anlama geliyor?" sorusunun cevabını saniyeler içinde alırsınız.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-card/50 border border-border/60 hover:border-primary/30 rounded-2xl p-6 shadow-2xs hover:shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert size={20} />
              </div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block mb-1">SWOT & Şirket Skoru</span>
              <h3 className="text-lg font-bold text-foreground mb-3">Yatırım Kararını Veriye Dayandır</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Özel algoritmamız her şirketi güçlü yönler, zayıflıklar, fırsatlar ve tehditler bazında değerlendirir. Tek bir skor değil, çok katmanlı bir tablo sunar.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 🧭 How It Works Section */}
      <section className="container mx-auto px-4 py-20 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            3 Dakikada Başla, Anında Analiz Et
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connector Line (Desktop Only) */}
          <div className="absolute top-[35px] left-[15%] right-[15%] h-[1px] bg-border/50 hidden md:block z-0" />

          {/* Step 1 */}
          <div className="text-center relative z-10 group">
            <div className="w-16 h-16 rounded-full bg-card border border-border hover:border-primary/50 text-foreground flex items-center justify-center font-black text-xl mx-auto mb-4 group-hover:scale-105 group-hover:shadow-xs transition-all duration-300">
              1
            </div>
            <h3 className="font-bold text-base mb-2">Google ile Giriş Yap</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed px-4">
              Kayıt formu yok. Tek tıkla hesabın hazır.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center relative z-10 group">
            <div className="w-16 h-16 rounded-full bg-card border border-border hover:border-primary/50 text-foreground flex items-center justify-center font-black text-xl mx-auto mb-4 group-hover:scale-105 group-hover:shadow-xs transition-all duration-300">
              2
            </div>
            <h3 className="font-bold text-base mb-2">Ücretsiz Kredinle Keşfet</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed px-4">
              Başlangıç kredilerin otomatik yüklenir. Hemen soru sormaya başlayabilirsin.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center relative z-10 group">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl mx-auto mb-4 hover:scale-105 hover:shadow-sm transition-all duration-300">
              3
            </div>
            <h3 className="font-bold text-base mb-2">Analiz Et, Karar Ver</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed px-4">
              İhtiyacına göre planını seç. Daha fazla analiz, daha güçlü modeller.
            </p>
          </div>

        </div>
      </section>

      {/* 💎 Pricing Section */}
      <section className="container mx-auto px-4 py-20 max-w-5xl relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Kullandığın Kadar Öde, İhtiyacın Kadar Güçlendir
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-light text-sm">
            Şeffaf kredi tabanlı modelimizle, bütçenizi en verimli şekilde yönetin. Sabit fiyatlar, sürpriz yok.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Starter Plan */}
          <div className="bg-card/45 border border-border/60 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between hover:scale-101 transition-transform duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Başlangıç</span>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-foreground">Ücretsiz</span>
              </div>
              <p className="text-xs text-muted-foreground italic mb-6">"Borsayı keşfetmeye başla"</p>
              
              <ul className="space-y-3 border-t border-border/40 pt-6 mb-8 text-sm">
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Hoş geldin kredisi</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Temel sorgular</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Standart AI modeli</span>
                </li>
              </ul>
            </div>

            {user ? (
              <button
                onClick={() => navigate({ to: '/panel' })}
                className="w-full bg-muted text-foreground py-2.5 rounded-full text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Panele Git
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full bg-muted text-foreground py-2.5 rounded-full text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Ücretsiz Deneyin
              </button>
            )}
          </div>

          {/* Professional Plan (Recommended) */}
          <div className="bg-card border-2 border-primary rounded-3xl p-8 flex flex-col justify-between hover:scale-101 transition-transform duration-300 relative shadow-md">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-xs animate-pulse-slow">
              Önerilen
            </div>
            
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">Profesyonel</span>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-foreground">99 TL</span>
                <span className="text-xs text-muted-foreground font-semibold">/ aylık</span>
              </div>
              <p className="text-xs text-muted-foreground italic mb-6">"Ciddiye alan yatırımcı için"</p>
              
              <ul className="space-y-3 border-t border-border/40 pt-6 mb-8 text-sm">
                <li className="flex items-center gap-2.5 text-foreground/85 font-semibold">
                  <Check size={14} className="text-primary shrink-0" />
                  <span>Genişletilmiş kredi paketi</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-primary shrink-0" />
                  <span>Teknik + temel analiz tam erişim</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-primary shrink-0" />
                  <span>Gelişmiş AI modeli</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-primary shrink-0" />
                  <span>KAP bildirimi yorumu</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-full text-xs font-bold hover:bg-primary/95 transition-all duration-300 shadow-xs cursor-pointer"
            >
              Hemen Satın Al
            </button>
          </div>

          {/* Expert Plan */}
          <div className="bg-card/45 border border-border/60 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between hover:scale-101 transition-transform duration-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Uzman</span>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-foreground">249 TL</span>
                <span className="text-xs text-muted-foreground font-semibold">/ aylık</span>
              </div>
              <p className="text-xs text-muted-foreground italic mb-6">"Vaktini veriye değil karara harca"</p>
              
              <ul className="space-y-3 border-t border-border/40 pt-6 mb-8 text-sm">
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Yüksek hacimli kullanım</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>En güçlü AI modeli</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/80 font-light">
                  <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Öncelikli yanıt hızı</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-muted text-foreground py-2.5 rounded-full text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Ekibe Ulaşın
            </button>
          </div>

        </div>
      </section>

      {/* ❓ FAQ Accordion Section */}
      <section className="container mx-auto px-4 py-20 max-w-3xl relative z-10">
        
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Aklındaki Sorular
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mx-auto" />
        </div>

        <div className="space-y-4">

          {/* Question 1 */}
          <div className="border border-border/70 rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleFaq(0)}
              className="w-full px-6 py-4.5 text-left font-semibold text-sm sm:text-base text-foreground/90 hover:text-foreground flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-primary" />
                Veriler ne kadar güvenilir?
              </span>
              <ChevronDown 
                size={18} 
                className={`text-muted-foreground transition-transform duration-300 shrink-0 ${openFaqIndex === 0 ? "rotate-180 text-primary" : ""}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 overflow-hidden ${
                openFaqIndex === 0 ? "max-h-[300px] border-t border-border/50" : "max-h-0"
              }`}
            >
              <p className="p-6 text-sm text-muted-foreground leading-relaxed font-light">
                Verilerimiz doğrudan resmi finansal kaynaklardan alınır, Python motorumuzla işlenir ve ikinci katman hesaplamalar (rasyolar, sektör medyanları, trend skorları) üretilir. Genel yapay zeka araçlarının aksine HissePro cevap <em>üretmez</em>, hesaplanan veriden <em>cevap türetir.</em>
              </p>
            </div>
          </div>

          {/* Question 2 */}
          <div className="border border-border/70 rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleFaq(1)}
              className="w-full px-6 py-4.5 text-left font-semibold text-sm sm:text-base text-foreground/90 hover:text-foreground flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-primary" />
                ChatGPT'den veya Gemini'den farkı ne?
              </span>
              <ChevronDown 
                size={18} 
                className={`text-muted-foreground transition-transform duration-300 shrink-0 ${openFaqIndex === 1 ? "rotate-180 text-primary" : ""}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 overflow-hidden ${
                openFaqIndex === 1 ? "max-h-[300px] border-t border-border/50" : "max-h-0"
              }`}
            >
              <p className="p-6 text-sm text-muted-foreground leading-relaxed font-light">
                Genel yapay zeka araçları BIST verilerine doğrudan erişemez ve halüsinasyon riski taşır. HissePro, BIST'e özel veri altyapısı ve finansal analiz motoruyla çalışır. Cevaplarımızın arkasında her zaman hesaplanmış bir veri kaynağı vardır.
              </p>
            </div>
          </div>

          {/* Question 3 */}
          <div className="border border-border/70 rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleFaq(2)}
              className="w-full px-6 py-4.5 text-left font-semibold text-sm sm:text-base text-foreground/90 hover:text-foreground flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-primary" />
                Kredi sistemi nasıl işliyor?
              </span>
              <ChevronDown 
                size={18} 
                className={`text-muted-foreground transition-transform duration-300 shrink-0 ${openFaqIndex === 2 ? "rotate-180 text-primary" : ""}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 overflow-hidden ${
                openFaqIndex === 2 ? "max-h-[300px] border-t border-border/50" : "max-h-0"
              }`}
            >
              <p className="p-6 text-sm text-muted-foreground leading-relaxed font-light">
                Her sorgu belirli bir kredi tüketir. Daha karmaşık analizler veya daha güçlü AI modelleri daha fazla kredi kullanır. Ücretsiz kredinizle sistemi tam olarak deneyimleyebilirsiniz.
              </p>
            </div>
          </div>

          {/* Question 4 */}
          <div className="border border-border/70 rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleFaq(3)}
              className="w-full px-6 py-4.5 text-left font-semibold text-sm sm:text-base text-foreground/90 hover:text-foreground flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-primary" />
                Yatırım tavsiyesi veriyor musunuz?
              </span>
              <ChevronDown 
                size={18} 
                className={`text-muted-foreground transition-transform duration-300 shrink-0 ${openFaqIndex === 3 ? "rotate-180 text-primary" : ""}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 overflow-hidden ${
                openFaqIndex === 3 ? "max-h-[300px] border-t border-border/50" : "max-h-0"
              }`}
            >
              <p className="p-6 text-sm text-muted-foreground leading-relaxed font-light">
                HissePro analiz aracıdır, yatırım danışmanı değildir. Sunduğumuz veriler ve analizler bilgilendirme amaçlıdır; yatırım kararlarınızın sorumluluğu size aittir.
              </p>
            </div>
          </div>

          {/* Question 5 */}
          <div className="border border-border/70 rounded-2xl bg-card/45 backdrop-blur-md overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleFaq(4)}
              className="w-full px-6 py-4.5 text-left font-semibold text-sm sm:text-base text-foreground/90 hover:text-foreground flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-primary" />
                Hangi hisseler destekleniyor?
              </span>
              <ChevronDown 
                size={18} 
                className={`text-muted-foreground transition-transform duration-300 shrink-0 ${openFaqIndex === 4 ? "rotate-180 text-primary" : ""}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 overflow-hidden ${
                openFaqIndex === 4 ? "max-h-[300px] border-t border-border/50" : "max-h-0"
              }`}
            >
              <p className="p-6 text-sm text-muted-foreground leading-relaxed font-light">
                Borsa İstanbul'da işlem gören tüm BIST şirketleri desteklenmektedir. Endeks bileşenleri, sektör analizleri ve endeks karşılaştırmaları da mevcuttur.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 🚀 Final CTA Section */}
      <section className="container mx-auto px-4 py-20 max-w-4xl text-center relative z-10">
        <div className="bg-gradient-to-br from-primary/10 via-fuchsia-500/5 to-transparent border border-primary/20 rounded-3xl p-8 sm:p-12 shadow-2xs backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none mb-4">
            BIST'i Analiz Etmeye Hazır mısın?
          </h2>
          
          <p className="text-sm sm:text-base text-muted-foreground font-light max-w-xl mx-auto leading-relaxed mb-8">
            Binlerce yatırımcının güvendiği BIST analiz platformuna bugün katıl. Kredi kartı gerekmez, kurulum yok — sadece Google hesabın yeterli.
          </p>

          <div className="flex flex-col items-center justify-center gap-3">
            {user ? (
              <button
                onClick={() => navigate({ to: '/panel' })}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Panele Git →</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Ücretsiz Deneyin →</span>
              </button>
            )}
            <span className="text-[11px] text-muted-foreground font-semibold">
              ✦ İlk analizini 2 dakika içinde yap
            </span>
          </div>

        </div>
      </section>

      {/* Footer Branding */}
      <footer className="container mx-auto px-4 pt-10 border-t border-border/30 text-center text-xs text-muted-foreground/60 font-medium">
        <p>© 2026 hissepro · Tüm Hakları Saklıdır.</p>
        <p className="mt-1">Yapay zeka analiz araçları bilgi amaçlıdır, yatırım tavsiyesi değildir.</p>
      </footer>

    </div>
  )
}

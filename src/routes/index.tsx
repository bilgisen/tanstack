import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Check, 
  X, 
  ChevronDown, 
  Sparkles, 
  ArrowRight
} from 'lucide-react'
import { Logo } from '../components/layout/Logo'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { user, loading, login: handleLogin } = useAuth()
  const navigate = useNavigate()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white font-sans">
        <Logo size={48} variant="icon" className="animate-pulse text-[#494fdf]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white select-none overflow-x-hidden font-sans">
      
      {/* 1. HERO BAND (STORYTELLING CANVAS - DARK) */}
      <section className="relative w-full bg-black pt-24 pb-16 md:pt-36 md:pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Animated Accent Glow (Subtle) */}
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-[#494fdf]/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />
        
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#16181a] border border-white/10 text-white/80 text-[11px] font-bold uppercase tracking-widest mb-8">
            <Sparkles size={12} className="text-[#494fdf]" />
            BIST Uzmanı Tek Yapay Zeka
          </div>

          <h1 className="display-xxl mb-8 text-white text-4xl sm:text-6xl font-bold tracking-tight">
            Borsa & Ötesi.
          </h1>
          
          <p className="body-lg text-white/70 max-w-2xl mx-auto mb-10 text-base sm:text-lg">
            Jetborsa, BIST'e özel eğitilmiş finansal analiz motoruyla hisse analizini, rasyoları ve teknik formasyonları saniyeler içinde sunar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {user ? (
              <button
                onClick={() => navigate({ to: '/panel' })}
                className="btn-revolut-primary w-full sm:w-auto"
              >
                <span>Panele Git</span>
                <ArrowRight size={18} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="btn-revolut-primary w-full sm:w-auto"
              >
                <span>Ücretsiz Deneyin</span>
                <ArrowRight size={18} className="ml-2" />
              </button>
            )}
            <button className="btn-revolut-outline-dark w-full sm:w-auto">
              Nasıl Çalışır?
            </button>
          </div>



        </div>
      </section>

      {/* 2. PRODUCT MOCKUP BAND (DARK) */}
      <section className="w-full bg-black py-12 px-6">
        <div className="max-w-6xl mx-auto rounded-[28px] border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Mockup Content - Left side */}
            <div className="lg:col-span-7 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#494fdf] flex items-center justify-center text-white">
                    <Logo size={24} variant="icon" />
                  </div>
                  <div>
                    <h3 className="heading-sm font-semibold">Jetborsa Terminal</h3>
                    <p className="body-sm text-white/50">Canlı BIST Verisi</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Live
                </div>
              </div>

              {/* Simulated Chart */}
              <div className="h-64 bg-black/40 rounded-2xl border border-white/5 relative p-6 mb-8 overflow-hidden group">
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-2xl font-bold font-mono">312.50</span>
                    <span className="ml-2 text-sm text-teal-400 font-bold">+2.45%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 uppercase block font-bold">Türk Hava Yolları</span>
                    <span className="text-sm font-bold">THYAO</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-end">
                   <svg className="w-full h-3/4 opacity-30" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path d="M0 80 Q 50 70, 100 85 T 200 60 T 300 40 T 400 20 L 400 100 L 0 100 Z" fill="#494fdf" />
                    <path d="M0 80 Q 50 70, 100 85 T 200 60 T 300 40 T 400 20" fill="none" stroke="#494fdf" strokeWidth="3" />
                   </svg>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-white/40 uppercase font-bold mb-1">F/K Oranı</span>
                  <span className="text-lg font-bold font-mono">5.24</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-white/40 uppercase font-bold mb-1">Sektör Ort.</span>
                  <span className="text-lg font-bold font-mono">6.85</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-white/40 uppercase font-bold mb-1">İskonto</span>
                  <span className="text-lg font-bold text-teal-400 font-mono">%23.5</span>
                </div>
              </div>
            </div>

            {/* Mockup Chat - Right side */}
            <div className="lg:col-span-5 bg-[#16181a] p-8 md:p-12 flex flex-col justify-between">
              <div className="space-y-6">
                 <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">U</div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-[13px] leading-relaxed border border-white/5">
                      THYAO son çeyrek bilanço analizi nedir?
                    </div>
                 </div>
                 <div className="flex gap-3 items-start flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-[#494fdf] flex items-center justify-center"><Sparkles size={12} /></div>
                    <div className="bg-[#494fdf]/10 border border-[#494fdf]/20 rounded-2xl rounded-tr-none p-4 text-[13px] leading-relaxed shadow-lg">
                      <strong>THYAO</strong> son çeyrekte net kârını %24 artırdı. Operasyonel verimlilik artışı ve düşük F/K oranı ile sektörde pozitif ayrışıyor.
                    </div>
                 </div>
              </div>

              <div className="mt-8 p-3 rounded-full bg-black/40 border border-white/10 flex items-center gap-3 text-white/40 text-xs">
                <Sparkles size={14} className="text-[#494fdf]" />
                <span>Analiz devam ediyor...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES BAND (CATALOGUE CANVAS - LIGHT) */}
      <section className="w-full bg-white text-black py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20">
            <h2 className="display-xl mb-6 text-black text-3xl sm:text-5xl font-bold tracking-tight">Hepsi bir arada.</h2>
            <p className="body-lg text-black/60 max-w-2xl text-base sm:text-lg">
              Jetborsa, karmaşık borsa verilerini anlamlı içgörülere dönüştürür.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-revolut-light flex flex-col justify-between h-full group hover:border-[#494fdf]/30 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#f4f4f4] text-[#494fdf] flex items-center justify-center mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="heading-sm mb-4 font-semibold text-lg">Temel Analiz</h3>
                <p className="body-sm text-black/60 leading-relaxed text-sm">
                  Onlarca finansal rasyo otomatik hesaplanır, sektör medyanlarıyla karşılaştırılır. Şirketin trendi saniyeler içinde önünüzde.
                </p>
              </div>
            </div>

            <div className="card-revolut-light flex flex-col justify-between h-full group hover:border-[#494fdf]/30 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#f4f4f4] text-[#494fdf] flex items-center justify-center mb-6">
                  <TrendingUp size={24} />
                </div>
                <h3 className="heading-sm mb-4 font-semibold text-lg">Teknik Analiz</h3>
                <p className="body-sm text-black/60 leading-relaxed text-sm">
                  Destek/direnç kırılmaları, formasyon tamamlanmaları ve momentum değişimleri Python motorumuzla anlık taranır.
                </p>
              </div>
            </div>

            <div className="card-revolut-light flex flex-col justify-between h-full group hover:border-[#494fdf]/30 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#f4f4f4] text-[#494fdf] flex items-center justify-center mb-6">
                  <MessageSquare size={24} />
                </div>
                <h3 className="heading-sm mb-4 font-semibold text-lg">AI Sohbet</h3>
                <p className="body-sm text-black/60 leading-relaxed text-sm">
                  "Hangi şirket sektöründe en iskontolu?" gibi sorularınıza veriye dayalı, halüsinasyonsuz cevaplar alın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON BAND (LIGHT) */}
      <section className="w-full bg-[#f4f4f4] text-black py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4 text-2xl sm:text-4xl font-bold tracking-tight">Kıyaslayın. Farkı görün.</h2>
          </div>

          <div className="bg-white rounded-[20px] overflow-hidden border border-[#e2e2e7] shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f4f4f4] border-b border-[#e2e2e7]">
                  <th className="p-6 font-bold text-[11px] uppercase tracking-widest text-black/40">Özellik</th>
                  <th className="p-6 font-bold text-[11px] uppercase tracking-widest text-[#494fdf] text-center">Jetborsa</th>
                  <th className="p-6 font-bold text-[11px] uppercase tracking-widest text-black/40 text-center">Diğerleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e7]">
                <tr>
                  <td className="p-6 body-sm font-semibold">Resmi BIST Verisi</td>
                  <td className="p-6 text-center text-[#494fdf]"><Check size={20} className="mx-auto" /></td>
                  <td className="p-6 text-center text-black/20"><X size={20} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-6 body-sm font-semibold">AI Veri Analizi</td>
                  <td className="p-6 text-center text-[#494fdf]"><Check size={20} className="mx-auto" /></td>
                  <td className="p-6 text-center text-black/20"><X size={20} className="mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-6 body-sm font-semibold">Sektör Kıyaslama</td>
                  <td className="p-6 text-center text-[#494fdf]"><Check size={20} className="mx-auto" /></td>
                  <td className="p-6 text-center text-black/20 text-sm">Sınırlı</td>
                </tr>
                <tr>
                  <td className="p-6 body-sm font-semibold">Düşük Halüsinasyon</td>
                  <td className="p-6 text-center text-[#494fdf]"><Check size={20} className="mx-auto" /></td>
                  <td className="p-6 text-center text-black/20"><X size={20} className="mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. PRICING BAND (STORYTELLING CANVAS - DARK) */}
      <section className="w-full bg-black text-white py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="display-xl mb-6 text-3xl sm:text-5xl font-bold tracking-tight">Planınızı seçin.</h2>
            <p className="body-lg text-white/60 text-base sm:text-lg">Ücretsiz başlayın, ihtiyacınıza göre yükseltin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-revolut-dark border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Standart</span>
                <h3 className="heading-lg mb-1 text-2xl font-bold">Ücretsiz</h3>
                <p className="body-sm text-white/50 mb-8 italic">Keşfetmek için</p>
                <ul className="space-y-4 border-t border-white/10 pt-8 mb-8">
                  <li className="flex items-center gap-3 text-white/80 body-sm"><Check size={16} className="text-[#494fdf]" /> Temel sorgular</li>
                  <li className="flex items-center gap-3 text-white/80 body-sm"><Check size={16} className="text-[#494fdf]" /> Sektör ortalamaları</li>
                </ul>
              </div>
              <button onClick={handleLogin} className="btn-revolut-dark w-full border border-white/20">Ücretsiz Başla</button>
            </div>

            <div className="card-revolut-featured flex flex-col justify-between shadow-2xl relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Önerilen</div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-2">Premium</span>
                <h3 className="heading-lg mb-1 text-2xl font-bold">99 TL</h3>
                <p className="body-sm text-white/70 mb-8 italic">Ciddi yatırımcılar için</p>
                <ul className="space-y-4 border-t border-white/20 pt-8 mb-8">
                  <li className="flex items-center gap-3 text-white body-sm"><Check size={16} /> Gelişmiş AI Analizi</li>
                  <li className="flex items-center gap-3 text-white body-sm"><Check size={16} /> Teknik Formasyonlar</li>
                  <li className="flex items-center gap-3 text-white body-sm"><Check size={16} /> KAP Bildirim Özetleri</li>
                </ul>
              </div>
              <button onClick={handleLogin} className="btn-revolut-primary w-full">Satın Al</button>
            </div>

            <div className="card-revolut-dark border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Uzman</span>
                <h3 className="heading-lg mb-1 text-2xl font-bold">249 TL</h3>
                <p className="body-sm text-white/50 mb-8 italic">Sınırsız güç</p>
                <ul className="space-y-4 border-t border-white/10 pt-8 mb-8">
                  <li className="flex items-center gap-3 text-white/80 body-sm"><Check size={16} className="text-[#494fdf]" /> Sınırsız sorgu</li>
                  <li className="flex items-center gap-3 text-white/80 body-sm"><Check size={16} className="text-[#494fdf]" /> Öncelikli destek</li>
                </ul>
              </div>
              <button onClick={handleLogin} className="btn-revolut-dark w-full border border-white/20">Ekiple İletişime Geç</button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ BAND (LIGHT) */}
      <section className="w-full bg-white text-black py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="heading-lg mb-12 text-center text-2xl sm:text-4xl font-bold tracking-tight">Sorularınız mı var?</h2>
          <div className="space-y-4">
             {[
               { q: "Veriler güncel mi?", a: "Evet, tüm veriler Borsa İstanbul'dan anlık olarak alınmaktadır." },
                { q: "Jetborsa yatırım tavsiyesi verir mi?", a: "Hayır, Jetborsa bir analiz aracıdır. Kararlarınızın sorumluluğu size aittir." },
               { q: "Kredi sistemi nasıl çalışır?", a: "Her analiz belirli bir kredi tüketir. Ücretsiz krediniz bittiğinde paket alabilirsiniz." }
             ].map((faq, i) => (
               <div key={i} className="border-b border-[#e2e2e7] pb-4">
                 <button onClick={() => toggleFaq(i)} className="w-full py-4 flex items-center justify-between text-left font-semibold hover:text-[#494fdf] transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown size={20} className={`transition-transform ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                 </button>
                 {openFaqIndex === i && <p className="body-sm text-black/60 pb-4 animate-in fade-in slide-in-from-top-2">{faq.a}</p>}
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA BAND (DARK) */}
      <section className="w-full bg-black text-white py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#494fdf]/10 blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto">
          <h2 className="display-lg mb-8 text-3xl sm:text-5xl font-bold tracking-tight">Yatırıma bugün başlayın.</h2>
          <button onClick={handleLogin} className="btn-revolut-primary">
            Ücretsiz Hesap Açın
          </button>
          <div className="mt-12 flex items-center justify-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
            <Check size={14} className="text-[#494fdf]" /> Kredi kartı gerekmez
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-black text-white/30 py-12 px-6 border-t border-white/5 text-center body-sm">
        <p>© 2026 Jetborsa. BIST uzmanı tek yapay zeka.</p>
      </footer>
    </div>
  )
}

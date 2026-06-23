import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, MessageSquare, BarChart3, TrendingUp, List, Check } from 'lucide-react'
import { Logo } from '../components/layout/Logo'

export const Route = createFileRoute('/nasil-calisir')({
  component: NasilCalisirPage,
})

function NasilCalisirPage() {
  return (
    <div className="min-h-screen bg-black text-white select-none overflow-x-hidden font-sans">
      
      {/* Hero */}
      <section className="relative w-full bg-black pt-24 pb-16 md:pt-36 md:pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-[#494fdf]/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />
        
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#16181a] border border-white/10 text-white/80 text-[11px] font-bold uppercase tracking-widest mb-8">
            <Logo size={12} variant="icon" className="text-[#494fdf]" />
            Jetborsa Rehberi
          </div>

          <h1 className="display-xxl mb-8 text-white text-4xl sm:text-6xl font-bold tracking-tight">
            Nasıl Çalışır?
          </h1>
          
          <p className="body-lg text-white/70 max-w-2xl mx-auto text-base sm:text-lg">
            Jetborsa, Borsa İstanbul verilerini yapay zeka ile analiz ederek yatırım kararlarınızı destekler. İşte adım adım nasıl kullanacağınız.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="w-full bg-black py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#494fdf]/10 border border-[#494fdf]/20 flex items-center justify-center text-[#494fdf] text-2xl font-bold">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Ücretsiz Hesap Oluşturun</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Google hesabınızla tek tıkla ücretsiz üye olun. Kredi kartı bilgisi gerekmez. Hemen 5 ücretsiz kredi ile başlarsınız.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#494fdf]">
                <Check size={16} /> Kredi kartı gerektirmez
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#494fdf]/10 border border-[#494fdf]/20 flex items-center justify-center text-[#494fdf] text-2xl font-bold">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Şirket veya Endeks Seçin</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Borsa İstanbul'daki tüm şirketler ve endeksler hazır. Arama çubuğundan veya gezinme menüsünden istediğiniz varlığı seçin.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">THYAO</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">GARAN</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">BIST 100</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">XU100</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#494fdf]/10 border border-[#494fdf]/20 flex items-center justify-center text-[#494fdf] text-2xl font-bold">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Detaylı Analizleri İnceleyin</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Her şirket için otomatik temel analiz (F/K, PD/DD, halka açıklık), teknik analiz (RSI, MACD, Bollinger) ve AI özeti alınır.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                  <BarChart3 size={20} className="mx-auto mb-2 text-[#494fdf]" />
                  <span className="text-xs text-white/60">Temel Analiz</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                  <TrendingUp size={20} className="mx-auto mb-2 text-[#494fdf]" />
                  <span className="text-xs text-white/60">Teknik Analiz</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                  <MessageSquare size={20} className="mx-auto mb-2 text-[#494fdf]" />
                  <span className="text-xs text-white/60">AI Özet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#494fdf]/10 border border-[#494fdf]/20 flex items-center justify-center text-[#494fdf] text-2xl font-bold">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">AI Asistanla Sohbet Edin</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Sağdaki sohbet panelinden şirket hakkında istediğiniz soruyu sorun. "THYAO son bilançosu nasıl?", "Sektörde en ucuz hisse hangisi?" gibi sorulara veriye dayalı cevaplar alın.
              </p>
              <div className="bg-[#16181a] rounded-xl p-4 border border-white/10 max-w-md">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">S</div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed border border-white/5">
                    THYAO’nun F/K oranı sektöre göre ucuz mu?
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#494fdf]/10 border border-[#494fdf]/20 flex items-center justify-center text-[#494fdf] text-2xl font-bold">
              5
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Takip Listeleri Oluşturun</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                İlgilendiğiniz hisseleri yıldız butonuna tıklayarak takip listenize ekleyin. Tek bir sayfada tüm favorilerinizi görüntüleyin ve AI ile toplu analiz yapın.
              </p>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <List size={16} className="text-[#494fdf]" /> Kişiselleştirilmiş takip deneyimi
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-black text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="display-lg mb-8 text-3xl sm:text-5xl font-bold tracking-tight">Hemen başlayın.</h2>
          <Link to="/" className="btn-revolut-primary inline-flex">
            <span>Ana Sayfaya Dön</span>
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white/30 py-12 px-6 border-t border-white/5 text-center body-sm">
        <p>© 2026 Jetborsa. BIST uzmanı tek yapay zeka.</p>
      </footer>
    </div>
  )
}

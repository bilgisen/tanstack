import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { 
  Shield, 
  Brain, 
  Database, 
  Zap, 
  Check, 
  X, 
  Sparkles,
  AlertTriangle
} from 'lucide-react'

export const Route = createFileRoute('/neden-jetborsa')({
  component: NedenJetborsaPage,
})

function NedenJetborsaPage() {
  const { login: handleLogin } = useAuth()

  return (
    <div className="min-h-full bg-background text-foreground select-none overflow-x-hidden font-sans">
      
      {/* Hero */}
      <section className="relative w-full pt-24 pb-16 md:pt-36 md:pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
        
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-8">
            <Shield size={12} />
            Neden Jetborsa?
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-8">
            Borsa analizi artık <span className="text-primary">güvenilir</span> olmalı.
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-base sm:text-lg leading-relaxed">
            Genel yapay zeka uygulamaları borsa analizinde size yanlış bilgi verebilir. 
            Jetborsa, doğruluğu teyit edilmiş veriler ve borsa uzmanı yapay zeka ile çalışır.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="w-full py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-widest mb-6">
              <AlertTriangle size={12} />
              Problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Genel AI neden yetersiz?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ChatGPT, Gemini gibi araçlar borsa analizinde ciddi sorunlara yol açabilir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <X size={24} className="text-destructive" />
              </div>
              <h3 className="font-bold mb-2">Halüsinasyon Riski</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Genel AI modelleri uydurma veriler üretebilir. Bir şirketin bilanço rakamları hakkında yanıltıcı bilgi verebilir.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <X size={24} className="text-destructive" />
              </div>
              <h3 className="font-bold mb-2">Güncel Veri Eksikliği</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Genel modellerin eğitim verileri eski olabilir. Borsa gibi sürekli değişen bir alanda bu ciddi bir sorundur.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <X size={24} className="text-destructive" />
              </div>
              <h3 className="font-bold mb-2">Finansal Analiz Eksikliği</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Temel ve teknik analiz araçları olmadan sadece genel bilgi verir, derinlemesine analiz yapamaz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="w-full py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} />
              Çözüm
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Jetborsa farkı
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Doğruluğu teyit edilmiş veriler ve borsa uzmanı yapay zeka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Database size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Teyit Edilmiş Veriler</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                KAP, Borsa İstanbul gibi resmi kaynaklardan alınan doğruluğu garanti edilmiş veriler kullanılır.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Brain size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Borsa Uzmanı AI</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BIST'e özel eğitilmiş yapay zeka modeli, finansal terimleri ve analizleri doğru yorumlar.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Güçlü Analiz Motoru</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Python tabanlı finansal analiz motoru, teknik ve temel analizleri otomatik hesaplar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="w-full py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Karşılaştırma</h2>
            <p className="text-muted-foreground">Jetborsa ile genel AI uygulamaları arasındaki farkı görün.</p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 bg-card">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-white/10">
                  <th className="p-5 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Özellik</th>
                  <th className="p-5 font-bold text-[11px] uppercase tracking-widest text-primary text-center">JetBorsa</th>
                  <th className="p-5 font-bold text-[11px] uppercase tracking-widest text-muted-foreground text-center">ChatGPT vb.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {[
                  'Doğruluğu teyit edilmiş veriler',
                  'Güçlü finansal analiz motoru',
                  'BIST\'e özel eğitilmiş',
                  'Halüsinasyon riski yok',
                  'Güncel haberler ve raporlar',
                  'KAP Bildirim analizi',
                  'SWOT Analizi',
                  'Şirket karşılaştırma',
                  'Sektör analizleri',
                ].map((feature, i) => (
                  <tr key={i}>
                    <td className="p-5 text-sm font-medium">{feature}</td>
                    <td className="p-5 text-center text-primary"><Check size={18} className="mx-auto" /></td>
                    <td className="p-5 text-center text-muted-foreground/30"><X size={18} className="mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">%100</div>
              <div className="text-sm text-muted-foreground">Doğruluk</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-muted-foreground">Halüsinasyon</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Anlık</div>
              <div className="text-sm text-muted-foreground">Veri Akışı</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">BIST</div>
              <div className="text-sm text-muted-foreground">Uzmanı</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8">Güvenle başlayın.</h2>
          <button onClick={handleLogin} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity cursor-pointer text-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
            </svg>
            <span>Ücretsiz Hesap Açın</span>
          </button>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <Check size={14} className="text-primary" /> Kredi kartı gerekmez
          </div>
        </div>
      </section>
    </div>
  )
}

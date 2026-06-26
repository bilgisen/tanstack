import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { 
  Building2, 
  Users, 
  Zap, 
  Shield, 
  Check, 
  ArrowRight,
  Headphones,
  BarChart3,
  Sparkles
} from 'lucide-react'

export const Route = createFileRoute('/kurumsal')({
  component: KurumsalPage,
})

function KurumsalPage() {
  const { login: handleLogin } = useAuth()

  return (
    <div className="min-h-full bg-background text-foreground select-none overflow-x-hidden font-sans">
      
      {/* Hero */}
      <section className="relative w-full pt-24 pb-16 md:pt-36 md:pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
        
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-8">
            <Building2 size={12} />
            Kurumsal Çözümler
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-8">
            Ekibiniz için <span className="text-primary">güçlü</span> analiz platformu.
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-base sm:text-lg leading-relaxed">
            Yatırım şirketleri, aracı kurumlar ve finans ekipleri için özel çözümler. 
            Toplu abonelik, özel destek ve kurumsal entegrasyon imkanları.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:info@jetborsa.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-lg"
            >
              <span>İletişime Geçin</span>
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Kurumsal avantajlar</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ekibinizin ihtiyaçlarına göre özelleştirilmiş çözümler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-card p-6 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Tolu Kullanım</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ekibinizdeki herkes aynı platformu kullanabilir. Tek hesap ile çoklu kullanıcı desteği.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Özel Analiz Raporları</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Şirketinize özel analiz raporları ve dashboard'lar. API entegrasyonu ile kendi sistemlerinize entegre edin.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Headphones size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Öncelikli Destek</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                7/24 öncelikli teknik destek. Size özel hesap yöneticisi ve hızlı çözüm garantisi.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Güvenli Altyapı</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kurumsal düzeyde güvenlik. Verileriniz güvende, KVKK uyumlu altyapı.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">API Erişimi</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                RESTful API ile kendi uygulamalarınızdan Jetborsa verilerine ve analizlerine erişin.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h3 className="font-bold mb-2">Özelleştirilmiş AI</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Şirketinize özel eğitilmiş AI modelleri. Kendi analiz kriterlerinizi ve raporlarınızı tanımlayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Kurumsal Planlar</h2>
            <p className="text-muted-foreground">Ekibinizin büyüklüğüne göre esnek fiyatlandırma.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Startup */}
            <div className="rounded-2xl border border-white/10 bg-card p-8 flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Startup</span>
                <h3 className="text-2xl font-bold">5-10 Kullanıcı</h3>
                <p className="text-muted-foreground mt-2 text-sm">Küçük yatırımcı ekipleri için</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> 10 kullanıcıya kadar</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> 50.000 HT/ay</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> E-posta desteği</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> Temel API erişimi</li>
              </ul>
              <a
                href="mailto:info@jetborsa.com?subject=Startup%20Kurumsal%20Plan"
                className="block w-full text-center px-5 py-3 rounded-xl border border-white/10 font-semibold hover:bg-muted/50 transition-colors text-sm"
              >
                İletişime Geç
              </a>
            </div>

            {/* Business */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Önerilen
              </div>
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Business</span>
                <h3 className="text-2xl font-bold">10-50 Kullanıcı</h3>
                <p className="text-muted-foreground mt-2 text-sm">Büyüyen finans ekipleri için</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> 50 kullanıcıya kadar</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> 250.000 HT/ay</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> Öncelikli destek</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> Tam API erişimi</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> Özel dashboard</li>
              </ul>
              <a
                href="mailto:info@jetborsa.com?subject=Business%20Kurumsal%20Plan"
                className="block w-full text-center px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                İletişime Geç
              </a>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-white/10 bg-card p-8 flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Enterprise</span>
                <h3 className="text-2xl font-bold">Sınırsız</h3>
                <p className="text-muted-foreground mt-2 text-sm">Büyük kurumlar için</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> Sınırsız kullanıcı</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> Sınırsız HT</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> 7/24 destek</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> Özel API</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> On-premise seçenek</li>
                <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary shrink-0" /> SLA garantisi</li>
              </ul>
              <a
                href="mailto:info@jetborsa.com?subject=Enterprise%20Kurumsal%20Plan"
                className="block w-full text-center px-5 py-3 rounded-xl border border-white/10 font-semibold hover:bg-muted/50 transition-colors text-sm"
              >
                İletişime Geç
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="w-full py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8">Ekibinizi güçlendirin.</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Kurumsal ihtiyaçlarınız için özel fiyatlandırma ve çözümler hakkında konuşalım.
          </p>
          <a
            href="mailto:info@jetborsa.com"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-lg"
          >
            <span>Bize Ulaşın</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  )
}

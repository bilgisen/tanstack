import { createFileRoute } from '@tanstack/react-router'
import { signIn } from '../lib/auth-client'
import { toast } from '../store/toast'
import { Sparkles, ArrowUp } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const handleGoogleLogin = async () => {
    toast.info("Google ile giriş işlemi başlatılıyor...", 2000);
    try {
      if (!signIn) {
        toast.error("Hata: Giriş modülü yüklenemedi.");
        return;
      }
      await signIn.social({
        provider: "google",
        callbackURL: "/panel",
      });
    } catch (err: any) {
      console.error("Google Login Error:", err);
      toast.error("Giriş başarısız: " + (err?.message || "Bağlantı hatası"));
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background px-6 relative pb-28">
      {/* Centered Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <section className="relative w-full max-w-5xl mx-auto flex flex-col items-center text-center overflow-hidden">
          {/* Animated Background Blur */}
          <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />
          
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Pulsing Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} className="text-primary animate-pulse" />
              BIST Uzmanı Tek Yapay Zeka
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
              Hemen Bağlanın
            </h1>
            
            <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base sm:text-lg leading-relaxed">
              Google ile hemen bağlanın, ücretsiz deneyin. <br /> Kredi kartı gerekmez.
            </p>

            {/* Premium Google Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-lg border border-primary/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                </svg>
                <span>Google ile Bağlanın</span>
              </button>
            </div>

            <p className="mt-8 text-[11px] text-muted-foreground/50 uppercase font-bold tracking-widest">
              Giriş yaparak kullanım koşullarını <br/> kabul etmiş olursunuz.
            </p>
          </div>
        </section>
      </div>

      {/* Floating Chat Trigger Bar Overlay (Matches other pages) */}
      <div 
        className="fixed left-4 right-4 z-40 flex justify-center pointer-events-none"
        style={{ 
          bottom: 'max(env(safe-area-inset-bottom, 0px) + 16px, 20px)' 
        }}
      >
        <div
          onClick={() => {
            toast.info("Analiz başlatabilmek için lütfen önce Google ile giriş yapın.");
          }}
          className="w-full max-w-3xl bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full shadow-2xl pointer-events-auto overflow-hidden cursor-pointer flex items-center px-6 py-2.5 justify-between"
        >
          <span className="text-muted-foreground/60 text-sm truncate pr-4">Borsa hakkında bir soru sorun...</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white shrink-0 self-center">
            <ArrowUp size={14} strokeWidth={2.5} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

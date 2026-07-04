import { createFileRoute } from '@tanstack/react-router'
import { signIn } from '../lib/auth-client'
import { toast } from '../store/toast'
import { Logo } from '../components/layout/Logo'
import { ArrowUp } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative pb-28">
      <div className="w-full max-w-sm text-center flex-1 flex flex-col justify-center py-12">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Logo size={32} variant="icon" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-3 text-foreground">Hemen Bağlanın</h1>
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-xs mx-auto">
          Google ile hemen bağlanın, ücretsiz deneyin. <br className="hidden sm:inline"/> Kredi kartı gerekmez.
        </p>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-foreground text-background font-semibold hover:opacity-90 active:scale-[0.98] transition-all text-sm cursor-pointer shadow-lg border border-border"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile Giriş Yap
        </button>

        <p className="mt-8 text-[11px] text-muted-foreground/50 uppercase font-bold tracking-widest">
          Giriş yaparak kullanım koşullarını <br/> kabul etmiş olursunuz.
        </p>
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

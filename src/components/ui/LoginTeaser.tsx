import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface LoginTeaserProps {
  preview?: string;
  cta?: string;
  className?: string;
}

export function LoginTeaser({
  preview = "Detaylı analizler ve teknik formasyonlar...",
  cta = "Analizin devamını görmek ve tüm özellikleri kullanmak için giriş yapın",
  className = "",
}: LoginTeaserProps) {
  const { login } = useAuth();

  return (
    <div className={`p-6 border border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}>
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
            <Sparkles size={12} className="animate-pulse" />
            <span>Kilitli Analiz Teaser</span>
          </div>
          {preview && (
            <p className="text-sm text-foreground/75 italic line-clamp-2">
              "{preview}"
            </p>
          )}
          <p className="text-sm font-semibold text-foreground">
            {cta}
          </p>
        </div>

        <button
          onClick={login}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition-all py-3 px-5 rounded-full text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <span>Google ile Giriş Yap</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

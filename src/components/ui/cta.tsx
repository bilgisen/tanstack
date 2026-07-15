import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemo } from "react";

const BAR_COUNT = 16;

function randomBars() {
  return Array.from({ length: BAR_COUNT }, (_, i) => ({
    id: i,
    h: 20 + Math.random() * 60,
    up: Math.random() > 0.45,
  }))
}

const CTA = ({ onLogin }: { onLogin?: () => void }) => {
  const initialBars = useMemo(() => randomBars(), [])

  return (
    <div className="px-0 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl border-y bg-muted/50 p-1 sm:rounded-xl sm:border-x">
        <div className="sm:shadow/5 relative flex flex-col justify-between gap-0 overflow-hidden border bg-background px-6 md:px-10 sm:rounded-lg md:flex-row md:gap-8">
          {/* Circuit Board Pattern */}
          <div
            className="max-sm:mask-b-from-75% pointer-events-none absolute inset-0 -top-0.5 -left-1 z-0 not-dark:opacity-60"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
                repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
                radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),
                radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)
              `,
              backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
            }}
          />

          {/* Left: Text */}
          <div className="relative isolate pt-10 pb-0 md:pb-10 z-10">
            <h2 className="font-bold text-3xl tracking-tight lg:text-4xl/[1.15]">
              Borsanın röntgenini çekin
            </h2>
            <p className="mt-2 text-muted-foreground text-lg sm:mt-3 lg:text-xl max-w-md">
              Borsa İstanbul uzmanı tek yapay zekanın yeteneklerini ücretsiz keşfedin.
            </p>
            <Button className="mt-5 sm:mt-8" size="lg" onClick={onLogin}>
              Google'la bağlan <ArrowUpRight />
            </Button>
            <p className="mt-2 text-xs text-muted-foreground/60">
              30 gün ücretsiz kullanın. Kredi kartı gerekmez.
            </p>
          </div>

          {/* Right: Animated Candlesticks */}
          <div className="relative isolate mt-6 md:mt-0 md:self-end flex items-end gap-[3px] md:gap-[4px] px-2 pb-4 md:pb-6 h-36 md:h-44">
            {/* Glow behind bars */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[120px] bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

            {initialBars.map((bar) => (
              <motion.div
                key={bar.id}
                className="w-[6px] md:w-[8px] rounded-t-sm relative"
                style={{
                  backgroundColor: bar.up ? 'rgb(34 197 94)' : 'rgb(239 68 68)',
                  originY: 1,
                }}
                animate={{
                  height: [bar.h + '%', bar.h + 10 + Math.random() * 30 + '%', bar.h + '%'],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: bar.id * 0.15,
                }}
              />
            ))}

            {/* Thin wick lines on some bars */}
            {initialBars.slice(0, 8).map((bar) => (
              <motion.div
                key={`wick-${bar.id}`}
                className="absolute w-[1.5px] bg-foreground/20"
                style={{
                  left: `calc(${bar.id * (6 + 3) + 4}px + 2px)`,
                  bottom: `calc(${bar.h}% + 8px)`,
                  height: '6px',
                }}
                animate={{ height: ['6px', '10px', '6px'] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: bar.id * 0.2 }}
              />
            ))}

            {/* Floating dots */}
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
              style={{ top: '15%', right: '20%' }}
              animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-1 h-1 rounded-full bg-emerald-400/40"
              style={{ top: '40%', right: '10%' }}
              animate={{ y: [0, -12, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="absolute w-1 h-1 rounded-full bg-red-400/40"
              style={{ top: '25%', right: '35%' }}
              animate={{ y: [0, -6, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;

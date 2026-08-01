import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = ({ onLogin }: { onLogin?: () => void }) => {
  return (
    <div className="px-0 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl border-y bg-muted/50 p-1 sm:rounded-xl sm:border-x">
        <div className="relative flex flex-col items-center text-center overflow-hidden border bg-background px-6 py-12 sm:rounded-lg sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 z-0 not-dark:opacity-60"
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

          <div className="relative z-10 max-w-lg">
            <h2 className="font-bold text-3xl tracking-tight lg:text-4xl/[1.15]">
              Borsanın röntgenini çekin
            </h2>
            <p className="mt-3 text-muted-foreground text-lg lg:text-xl">
              Borsa İstanbul uzmanı tek yapay zekanın yeteneklerini ücretsiz keşfedin.
            </p>
            <Button className="mt-8" size="lg" onClick={onLogin}>
              Google'la bağlan <ArrowUpRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;

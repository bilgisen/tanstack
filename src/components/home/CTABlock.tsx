import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function CTABlock({
  onStart,
  ctaLabel = "Nasıl çalışıyor",
}: {
  onStart?: () => void
  ctaLabel?: string
}) {
  return (
    <section>
      <div className="py-8 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-16">
          <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-3xl border border-border px-6 before:absolute before:top-24 before:-z-10 before:h-4/5 before:w-full before:rounded-full before:bg-linear-to-r before:from-sky-100 before:from-15% before:via-white before:via-55% before:to-amber-100 before:to-90% before:blur-3xl dark:before:from-sky-400/10 dark:before:from-40% dark:before:via-black dark:before:via-55% dark:before:to-amber-300/10 dark:before:to-60%">
            <motion.div
              initial={{ y: "5%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mx-auto flex flex-col items-center gap-6"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <h2 className="text-2xl leading-snug font-medium md:text-4xl">
                  ChatGPT halüsinasyon görür, biz güvenilir analizler sunarız.
                </h2>
                <p className="mx-auto max-w-2xl text-lg">
                  BIST verileri güçlü finansal algoritmalarla işlenir ve her
                  şirket için zengin veri kataloğu hazırlanır. AI sadece
                  doğrulanmış verileri analiz eder.
                </p>
              </div>
              <Button
                onClick={onStart}
                variant="outline"
                className="h-14 w-fit cursor-pointer rounded-full px-10 text-base font-medium transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                {ctaLabel}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

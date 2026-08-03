import { Layers, Shield } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Güvenilir Veri ve Kesin Hesaplama",
    description: [
      "KAP ve BIST verileri güçlü algoritmalarla işlenir ve yapay zekaya hazır sunulur.",
      "AI sadece doğrulanmış veri kataloğunu analiz ettiği için halüsinasyon riski kalmaz.",
    ],
  },
  {
    icon: Layers,
    title: "Piyasa ve BIST Hakimiyeti",
    description: [
      "Temel ve teknik analiz eğitimi almış AI; haberler ve analist raporlarıyla beslenir.",
      "Deep Search ile anlık verilere ulaşır ve finansal okuryazarlık sorularınızı da yanıtlar.",
    ],
  },
]

export function Hero1A() {
  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute top-16 left-1/2 -z-10 h-72 w-[120%] -translate-x-1/2 rounded-full bg-linear-to-r from-sky-100 from-15% via-white via-55% to-amber-100 to-90% blur-3xl dark:from-sky-400/10 dark:from-40% dark:via-black dark:via-55% dark:to-amber-300/10 dark:to-60%" />
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] -z-10 h-[80vw] w-[80vw] animate-pulse rounded-full bg-primary/5 blur-[120px]" />

      <div className="mx-auto w-full max-w-5xl text-left">
        <h2 className="mb-10 max-w-2xl text-2xl font-medium leading-snug md:text-4xl">
          Sıradan AI modelleri halüsinasyon görür. Biz ise finansal verinin
          güvenilirliğini garanti ederiz.
        </h2>

        <div className="flex max-w-2xl flex-col gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-6 text-left"
            >
              <feature.icon
                className="mt-1 size-[52px] shrink-0 text-primary"
                strokeWidth={1}
              />
              <div>
                <span className="text-lg font-semibold">{feature.title}</span>
                <div className="mt-3 space-y-2">
                  {feature.description.map((line, i) => (
                    <p
                      key={i}
                      className="text-[15px] leading-relaxed text-foreground/80"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

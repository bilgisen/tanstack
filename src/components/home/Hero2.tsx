import { BarChart3, Globe, TrendingUp, Users } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Teknik Analiz",
    description: "Güncel grafik, formasyon ve momentum takibi.",
  },
  {
    icon: BarChart3,
    title: "Temel Analiz",
    description: "Otomatik rasyo analizi ve sektör kıyaslaması.",
  },
  {
    icon: Globe,
    title: "Sektör Analizi",
    description: "Sektör içi ortalama, trend ve sıralamalar.",
  },
  {
    icon: Users,
    title: "Şirket Karşılaştırma",
    description: "F/K ve PD/DD gibi rasyoları karşılaştırın.",
  },
]

export function Hero2() {
  return (
    <section className="w-full px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-2xl font-medium md:text-4xl">
          Yatırımlarınıza sezgiler değil veriler yön versin.
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl border border-border/20 bg-card/50 p-6 transition-colors hover:bg-muted/30 lg:flex-col lg:items-start"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted lg:mb-5">
                <feature.icon className="size-5" />
              </div>
              <div>
                <span className="text-lg font-medium">{feature.title}</span>
                <p className="mt-1 text-[15px] text-foreground/80">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

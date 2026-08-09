import { BarChart3, Globe, MessageSquare, Star, TrendingUp, Users } from "lucide-react"

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
  {
    icon: MessageSquare,
    title: "AI Sohbet",
    description: "BIST uzmanı yapay zekâya anında soru sorun.",
  },
  {
    icon: Star,
    title: "Takip Listesi",
    description: "Favori hisse ve endekslerinizi tek ekranda izleyin.",
  },
]

export function Hero2() {
  return (
    <section className="w-full px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-2xl font-medium md:text-4xl">
          Neler Yapabilirsiniz?
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl border border-border/20 bg-card/50 p-6 transition-colors hover:bg-muted/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <feature.icon className="size-5" />
              </div>
              <div>
                <span className="text-xl font-medium sm:text-lg">{feature.title}</span>
                <p className="mt-1 text-base text-foreground/80 sm:text-[15px]">
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

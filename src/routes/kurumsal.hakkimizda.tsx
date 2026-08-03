import { createFileRoute } from "@tanstack/react-router"
import { Brain, Eye, Heart, ShieldCheck, Target, Trophy } from "lucide-react"

export const Route = createFileRoute("/kurumsal/hakkimizda")({
  component: HakkimizdaPage,
})

const VALUES = [
  {
    icon: Target,
    title: "Misyonumuz",
    desc: "Doğrulanmış BIST verilerini yapay zekâ ile işleyerek bireysel yatırımcıya kurumsal düzeyde içgörü sunmak ve bilinçli karar almayı demokratikleştirmek.",
  },
  {
    icon: Eye,
    title: "Vizyonumuz",
    desc: "Türkiye’nin yapay zekâ destekli finansal analizde en güvenilir platformu olmak ve finansal okuryazarlığı artırmak.",
  },
  {
    icon: ShieldCheck,
    title: "Güven",
    desc: "Analizlerimiz yalnızca doğrulanmış verilere dayanır. Halüsinasyon yapmayan, şeffaf ve tutarlı bir asistan anlayışı benimseriz.",
  },
  {
    icon: Heart,
    title: "Yatırımcı Odaklılık",
    desc: "Karmaşık finansal verileri anlaşılır hale getirerek herkesin kendine güvenerek yatırım kararı alabilmesini hedefliyoruz.",
  },
]

const HIGHLIGHTS = [
  { icon: Brain, label: "LLM destekli, BIST odaklı yapay zekâ asistanı" },
  { icon: Trophy, label: "BIST 500 şirketi için derin temel ve teknik analiz" },
]

function HakkimizdaPage() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold">Hakkımızda</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          JetBorsa, BIST uzmanı yapay zekâ destekli bir finansal analiz
          platformudur. Amacımız, borsayı derinlemesine analiz eden sistemlerin
          yalnızca kurumlara değil, her yatırımcıya erişilebilir olmasını
          sağlamaktır.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          Platformun kalbi; teknik analiz, temel analiz, sektör kıyaslamaları ve
          finansal tablo yorumlamada size yol gösteren, doğrulanmış verilerle
          beslenen yapay zekâ asistanıdır.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-border/20 bg-card/50 p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <v.icon className="size-5 text-primary" />
            </div>
            <h3 className="font-semibold">{v.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {v.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {HIGHLIGHTS.map((h) => (
          <div
            key={h.label}
            className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/50 p-4"
          >
            <h.icon className="size-5 shrink-0 text-primary" />
            <span className="text-sm">{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

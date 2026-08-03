import { createFileRoute } from "@tanstack/react-router"
import { AtSign, Megaphone, Newspaper } from "lucide-react"

export const Route = createFileRoute("/kurumsal/reklam-isbirligi")({
  component: ReklamIsbirligiPage,
})

const OPPORTUNITIES = [
  {
    icon: Megaphone,
    title: "Reklam Alanları",
    desc: "Platformumuzdaki banner, sponsorlu içerik ve ürün tanıtımı alanlarıyla hedef kitlenize ulaşın.",
  },
  {
    icon: Newspaper,
    title: "Medya ve PR",
    desc: "Yapay zekâ ve BIST odaklı platformumuzu medya işbirlikleri ve içerik ortaklıklarıyla büyütün.",
  },
  {
    icon: AtSign,
    title: "API & Veri Ortaklıkları",
    desc: "BIST analizlerini kendi ürününüze entegre etmek için veri ve API işbirliklerine açığız.",
  },
]

function ReklamIsbirligiPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Reklam ve İşbirliği</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          JetBorsa ile markanızı finans odaklı, büyüyen bir ekosistemde görünür
          kılın. Sunduğumuz işbirliği modellerinden size uygun olanı seçin ve
          ekibimizle konuşalım.
        </p>
      </div>

      <div className="space-y-4">
        {OPPORTUNITIES.map((o) => (
          <div
            key={o.title}
            className="flex items-start gap-4 rounded-2xl border border-border/20 bg-card/50 p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <o.icon className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{o.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {o.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm leading-relaxed">
          İşbirliği teklifleriniz için:{" "}
          <a
            href="mailto:info@jetborsa.com"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            info@jetborsa.com
          </a>
        </p>
      </div>
    </div>
  )
}

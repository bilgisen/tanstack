import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/kurumsal/yasal-uyari")({
  component: YasalUyariPage,
})

const SECTIONS = [
  {
    title: "Yatırım Danışmanlığı Değildir",
    body: "Burada yer alan bilgi, yorum ve analizler yatırım danışmanlığı kapsamında değildir. Yatırım danışmanlığı hizmeti, aracı kurumlar ve portföy yönetim şirketleri ile müşteri arasında imzalanacak sözleşme çerçevesinde sunulur.",
  },
  {
    title: "Risk Bildirimi",
    body: "Sermaye piyasası araçlarının geçmiş performansı, gelecekteki getirileri için bir gösterge değildir. Yatırım kararlarınızı almadan önce kendi araştırmanızı yapmalı ve gerekirse bir uzmana danışmalısınız.",
  },
  {
    title: "Yapay Zekâ Analizlerinin Sınırları",
    body: "Platform tarafından üretilen analizler algoritmik olarak doğrulanmış verilere dayanır ancak herhangi bir getiri garantisi sağlamaz. Veriler gecikmeli veya eksik olabilir.",
  },
  {
    title: "Fikri Mülkiyet",
    body: "Bu sitedeki içerik, marka, logo ve yazılım JetBorsa’ya aittir. İzinsiz kopyalama, çoğaltma ve dağıtım yapılamaz.",
  },
]

function YasalUyariPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Yasal Uyarı</h2>
      <p className="leading-relaxed text-muted-foreground">
        JetBorsa platformunu kullanmadan önce aşağıdaki koşulları okumanızı
        öneririz. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
      </p>
      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-border/20 bg-card/50 p-5"
          >
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

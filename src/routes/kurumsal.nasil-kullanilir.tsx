import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/kurumsal/nasil-kullanilir")({
  component: NasilKullanilirPage,
})

function NasilKullanilirPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Nasıl Kullanılır?</h2>
      <p className="text-muted-foreground">
        JetBorsa'nın yapay zeka destekli analizlerinden en verimli şekilde nasıl
        yararlanabileceğinizi öğrenin.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: "Veri Analizi",
            desc: "AI, BIST verilerini anlık olarak tarar ve modeller.",
          },
          {
            title: "Soru Sorun",
            desc: "ChatPane üzerinden merak ettiğiniz her şeyi sorun.",
          },
          {
            title: "Takip Edin",
            desc: "Kendi takip listenizi oluşturun ve özel uyarılar alın.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card/50 p-6"
          >
            <h3 className="mb-2 font-bold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

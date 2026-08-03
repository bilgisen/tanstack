import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/kurumsal/")({
  component: KurumsalOverview,
})

function KurumsalOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Genel Bakış</h2>
      <p className="leading-relaxed text-muted-foreground">
        JetBorsa, BIST yatırımcıları için tasarlanmış en gelişmiş yapay zeka
        analiz platformudur. Bu bölümden şirketimiz, işleyişimiz ve yasal
        prosedürlerimiz hakkında detaylı bilgi alabilirsiniz.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="mb-2 font-bold">Vizyonumuz</h3>
          <p className="text-sm text-muted-foreground">
            Yapay zeka ile finansal okuryazarlığı artırmak ve her yatırımcıyı
            bir uzman seviyesine taşımak.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="mb-2 font-bold">Teknolojimiz</h3>
          <p className="text-sm text-muted-foreground">
            En güncel LLM modelleri ve özel finansal algoritmalarla donatılmış
            altyapı.
          </p>
        </div>
      </div>
    </div>
  )
}

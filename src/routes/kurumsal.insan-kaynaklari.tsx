import { createFileRoute } from "@tanstack/react-router"
import { JobApplicationForm } from "@/components/forms/JobApplicationForm"

export const Route = createFileRoute("/kurumsal/insan-kaynaklari")({
  component: InsanKaynaklariPage,
})

const OPENINGS = [
  {
    title: "Yazılım Mühendisi",
    dept: "Teknoloji",
    desc: "React/TanStack ekosisteminde ölçeklenebilir finans uygulamaları geliştirecek ekip arkadaşı.",
  },
  {
    title: "Veri Bilimci / ML Mühendisi",
    dept: "Yapay Zeka",
    desc: "Finansal analiz modelleri ve LLM entegrasyonları üzerinde çalışacak uzman.",
  },
  {
    title: "Sermaye Piyasası Uzmanı",
    dept: "Araştırma",
    desc: "BIST şirketlerini temel ve teknik açıdan analiz edecek ekip üyesi.",
  },
]

function InsanKaynaklariPage() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">İnsan Kaynakları</h2>
          <p className="mt-2 text-muted-foreground">
            JetBorsa, finans ve teknolojiyi buluşturan dinamik bir ekip. Eğer
            borsa analizine tutkuluysan ve yapay zekayla gerçek ürünler kurmak
            istiyorsan, sen de aramıza katıl.
          </p>
        </div>

        <div className="space-y-3">
          {OPENINGS.map((job) => (
            <div
              key={job.title}
              className="rounded-2xl border border-border/20 bg-card/50 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{job.title}</h3>
                <span className="text-xs font-bold tracking-widest text-primary uppercase">
                  {job.dept}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{job.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-xl border border-border bg-card/50 p-6">
        <h3 className="mb-4 font-semibold">Spontan Başvuru</h3>
        <JobApplicationForm />
      </div>
    </div>
  )
}

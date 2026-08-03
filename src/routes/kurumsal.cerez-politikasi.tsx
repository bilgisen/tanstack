import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/kurumsal/cerez-politikasi")({
  component: CerezPolitikasiPage,
})

const COOKIE_TYPES = [
  {
    type: "Zorunlu (Oturum) Çerezleri",
    desc: "Site içi oturumunuzu ve güvenliği sağlamak için gereklidir. Devre dışı bırakıldığında site düzgün çalışmayabilir.",
  },
  {
    type: "Fonksiyonel Çerezler",
    desc: "Tercihlerinizi (dil, görünüm, takip listeniz) hatırlamamızı sağlar.",
  },
  {
    type: "Analitik Çerezler",
    desc: "Hizmetimizin nasıl kullanıldığını anonim olarak ölçer ve deneyimi iyileştirmemize yardımcı olur.",
  },
  {
    type: "Pazarlama Çerezleri",
    desc: "İlgili reklam ve kampanyaların gösterilmesi için kullanılır.",
  },
]

function CerezPolitikasiPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Çerez Politikası</h2>
      <p className="leading-relaxed text-muted-foreground">
        JetBorsa web sitesi ve uygulaması, size daha iyi bir deneyim sunabilmek
        ve hizmetimizi geliştirebilmek amacıyla belirli çerezler kullanır. Bu
        politikada hangi çerezleri neden kullandığımızı açıklıyoruz.
      </p>

      <div className="space-y-4">
        {COOKIE_TYPES.map((c) => (
          <div
            key={c.type}
            className="rounded-2xl border border-border/20 bg-card/50 p-5"
          >
            <h3 className="font-semibold">{c.type}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {c.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-border/20 bg-card/50 p-5">
        <h3 className="font-semibold">Çerezleri Nasıl Yönetirsiniz?</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tarayıcınızın ayarları bölümünden çerezleri istediğiniz zaman
          silebilir veya engelleyebilirsiniz. Bazı çerezlerin engellenmesi,
          sitenin tüm işlevlerinin çalışamamasına neden olabilir.
        </p>
      </div>
    </div>
  )
}

import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/kurumsal/bilgi-toplumu-hizmetleri")({
  component: BilgiToplumuHizmetleriPage,
})

function BilgiToplumuHizmetleriPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Bilgi Toplumu Hizmetleri</h2>
      <p className="leading-relaxed text-muted-foreground">
        6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve ilgili
        yönetmelikler uyarınca bildirimlerimiz aşağıdadır.
      </p>

      <div className="space-y-4">
        {[
          { label: "Hizmet Sağlayıcı", value: "JetBorsa" },
          {
            label: "Adres",
            value:
              "Dumlupınar Mahallesi, İnfak Sokak, No:1, Ümraniye İstanbul, Türkiye",
          },
          { label: "E-posta", value: "info@jetborsa.com" },
          { label: "Uygulama Koordinatörü", value: "Hasan Karabey" },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-border/20 bg-card/50 p-5"
          >
            <h3 className="text-xs font-bold tracking-widest text-primary uppercase">
              {row.label}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/20 bg-card/50 p-5">
        <h3 className="font-semibold">İletişime Geçin</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Elektronik ticaret kapsamında bize bildirmek istediğiniz her türlü
          şikayet ve talebi info@jetborsa.com adresine iletebilirsiniz.
        </p>
      </div>
    </div>
  )
}

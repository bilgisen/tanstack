import { createFileRoute } from "@tanstack/react-router"
import { FeedbackForm } from "@/components/forms/FeedbackForm"

export const Route = createFileRoute("/kurumsal/geri-bildirim")({
  component: GeriBildirimPage,
})

function GeriBildirimPage() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Geri Bildirim</h2>
          <p className="mt-2 text-muted-foreground">
            Fikirleriniz, önerileriniz ve raporladığınız hatalar sayesinde
            JetBorsa'yı her gün daha iyi hale getiriyoruz. Görüşleriniz bizim
            için çok değerli.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="rounded-xl border border-border/20 bg-card/50 p-4">
            <strong className="text-foreground">Soru / Destek:</strong> Ürünle
            ilgili yardıma mı ihtiyacınız var? O zaman önce SSS ve Nasıl
            Çalışır? sayfalarına göz atmak isteyebilirsiniz.
          </li>
          <li className="rounded-xl border border-border/20 bg-card/50 p-4">
            <strong className="text-foreground">Hata raporu:</strong> Veri veya
            arayüz hatası mı gördünüz? Mümkünse hangi sayfada ve hangi işlem
            sonrasında oluştuğunu yazın, hızlıca çözelim.
          </li>
          <li className="rounded-xl border border-border/20 bg-card/50 p-4">
            <strong className="text-foreground">Özellik isteği:</strong> Görmek
            istediğiniz analizleri veya araçları bize iletin; yol haritamızda
            değerlendirelim.
          </li>
        </ul>
      </div>

      <div className="h-fit rounded-xl border border-border bg-card/50 p-6">
        <h3 className="mb-4 font-semibold">Görüşlerinizi Paylaşın</h3>
        <FeedbackForm />
      </div>
    </div>
  )
}

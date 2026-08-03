import { createFileRoute } from "@tanstack/react-router"
import { Mail, MapPin } from "lucide-react"
import { ContactForm } from "@/components/forms/ContactForm"

export const Route = createFileRoute("/kurumsal/iletisim")({
  component: IletisimPage,
})

function IletisimPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">İletişim</h2>
        <p className="mt-2 text-muted-foreground">
          Her türlü soru, öneri ve işbirliği talepleriniz için bizimle iletişime
          geçebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-border/20 bg-card/50 p-4">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Adres</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Dumlupınar Mahallesi, İnfak Sokak, No:1, Ümraniye İstanbul,
                Türkiye
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border/20 bg-card/50 p-4">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">E-posta</h3>
              <a
                href="mailto:info@jetborsa.com"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                info@jetborsa.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border/20 bg-card/50 p-4">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Sosyal Medya</h3>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <a
                  href="https://x.com/jetborsax"
                  className="hover:text-primary"
                >
                  x.com/jetborsax
                </a>
                <a
                  href="https://linkedin.com/company/jetborsa"
                  className="hover:text-primary"
                >
                  LinkedIn / JetBorsa
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-border bg-card/50 p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}

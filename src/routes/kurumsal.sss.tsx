import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/kurumsal/sss")({
  component: SssPage,
})

const FAQ = [
  {
    q: "JetBorsa nedir?",
    a: "JetBorsa, BIST (Borsa İstanbul) verilerini derinlemesine analiz eden, yapay zeka destekli bir finansal analiz platformudur. Bireysel yatırımcılara kurumsal düzeyde içgörüler sunar.",
  },
  {
    q: "JetBorsa ücretsiz mi?",
    a: "Platform belirli özellikleri ücretsiz sunar. Kullanıcı limitleri ve abonelik paketleri için profil sayfasındaki planları inceleyebilirsiniz.",
  },
  {
    q: "Arabian analizler nasıl üretiliyor?",
    a: "Analizler, BIST veri setleriyle eğitilmiş finansal algoritmalar ve doğrulanmış veriler üzerine kurulu. LLM destekli asistan yalnızca doğrulanmış verileri kullanır ve halüsinasyondan kaçınır.",
  },
  {
    q: "Yatırım danışmanlığı veriyor musunuz?",
    a: "Hayır. JetBorsa bir yatırım danışmanlığı hizmeti değildir. Tüm analizler bilgilendirme amaçlıdır ve yatırım kararlarınız için yasal uyarı sayfamıza başvurmalısınız.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Evet. KVKK uyumlu altyapı, şifreli iletimler ve en güncel güvenlik önlemleri kullanıyoruz. Detaylar için KVKK sayfamıza göz atabilirsiniz.",
  },
  {
    q: "İletişime nasıl geçerim?",
    a: "info@jetborsa.com adresinden bize ulaşabilir ya da İletişim sayfasındaki formu doldurabilirsiniz.",
  },
]

function SssPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Sıkça Sorulan Sorular</h2>
      <div className="space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border/20 bg-card/50 p-5 open:bg-muted/20"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              <span>{item.q}</span>
              <span className="text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  )
}

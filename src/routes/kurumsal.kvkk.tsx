import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/kurumsal/kvkk")({
  component: KvkkPage,
})

const SECTIONS = [
  {
    title: "1. Veri Sorumlusu",
    body: "KVKK kapsamında veri sorumlusu JetBorsa’dır. Adres: Dumlupınar Mahallesi, İnfak Sokak, No:1, Ümraniye İstanbul, Türkiye. E-posta: info@jetborsa.com",
  },
  {
    title: "2. İşlenen Kişisel Veriler",
    body: "Kimlik bilgileri (ad, soyad), iletişim bilgileri (e-posta), üyelik ve hesap bilgileri, abonelik bilgileri, cihaz ve log kayıtları ile destek taleplerinde paylaşılan bilgiler.",
  },
  {
    title: "3. İşleme Amaçları",
    body: "Hesap oluşturma ve yönetimi, hizmet sunumu ve kişiselleştirme, ödeme ve abonelik süreçleri, güvenlik ve dolandırıcılığın önlenmesi, yasal yükümlülüklerin yerine getirilmesi ve iletişim faaliyetleri.",
  },
  {
    title: "4. Aktarım",
    body: "Veriler, hizmetin sunulması amacıyla çalıştığımız bulut ve altyapı sağlayıcılarına, ödeme işlemleri kapsamında yetkili kuruluşlara ve yasal zorunluluk durumunda yetkili makamlara aktarılabilir.",
  },
  {
    title: "5. Saklama Süresi",
    body: "Kişisel veriler, işleme amacının gerektirdiği süre boyunca ve kanuni sürelerin sona ermesine kadar saklanır; süre sonunda silinir, yok edilir veya anonim hale getirilir.",
  },
  {
    title: "6. Haklarınız (KVKK m.11)",
    body: "Verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zarar halinde tazminat talep etme haklarınız bulunmaktadır.",
  },
  {
    title: "7. Başvuru",
    body: "Haklarınızı kullanmak için info@jetborsa.com adresine başvurabilirsiniz. Talebiniz, en geç 30 gün içinde sonuçlandırılır.",
  },
]

function KvkkPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">KVKK Aydınlatma Metni</h2>
      <p className="leading-relaxed text-muted-foreground">
        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca,
        verilerinizin işlenme süreçleri hakkında sizi bilgilendirmek isteriz.
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

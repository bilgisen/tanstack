import { Link } from '@tanstack/react-router'
import { LogoFooter } from '../layout/LogoFooter'

const footerMenus = [
  {
    items: [
      { label: 'Nasıl kullanılır?', to: '/sistemimiz' },
      { label: 'Hakkımızda', to: '/sistemimiz' },
      { label: 'İletişim', to: '/sistemimiz' },
    ],
  },
  {
    items: [
      { label: 'Endeksler', to: '/sistemimiz' },
      { label: 'Şirketler', to: '/sistemimiz' },
    ],
  },
  {
    items: [
      { label: 'Kullanım Koşulları', to: '/sistemimiz' },
      { label: 'Gizlilik İlkeleri', to: '/sistemimiz' },
      { label: 'Geri Bildirim', to: '/sistemimiz' },
      { label: 'Çerez Tercihleri', to: '/sistemimiz' },
    ],
  },
]

function XLogo({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedinLogo({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  )
}

export function HomeFooter() {
  return (
    <footer className="mt-10 md:mt-16 bg-[#2b2f85] text-white px-4 md:px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Top: Logo + Social */}
        <div className="flex items-center justify-between mb-10 pt-6 pb-8 border-b border-white/15">
          <Link to="/" aria-label="JetBorsa ana sayfa">
            <LogoFooter size={32} />
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <LinkedinLogo size={18} className="text-white" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <XLogo size={16} className="text-white" />
            </a>
          </div>
        </div>

        {/* Middle: Menus */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {footerMenus.map((menu, i) => (
            <ul key={i} className="flex flex-col gap-2.5">
              {menu.items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Bottom: Legal */}
        <div className="pt-8 border-t border-white/15">
          <p className="text-xs text-primary-foreground/70 mb-3">
            Piyasa verileri 15 dakika gecikmeli verilmektedir.
          </p>
          <p className="text-xs text-primary-foreground/60 leading-relaxed">
            Yasal Uyarı Notu: Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir. Yatırım danışmanlığı hizmeti, yetkili kuruluşlar tarafından kişilerin risk ve getiri tercihleri dikkate alınarak kişiye özel sunulmaktadır. Burada yer alan yorum ve tavsiyeler ise genel niteliktedir. Bu tavsiyeler mali durumunuz ile risk ve getiri tercihlerinize uygun olmayabilir. Bu nedenle, sadece burada yer alan bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize uygun sonuçlar doğurmayabilir. Bu bilgiler ve görüşler önceden haber vermeksizin değiştirilebilir. JetBorsa.com bilgilerin ve ifade edilen görüşlerin doğru, eksiksiz ve güncelleştirilmiş olduğuna dair (açıkça ifade edilmiş veya ima edilmiş) hiçbir beyan ve taahhütte bulunmaz. İçerik kesinlikle mali, hukuki, vergi veya diğer konularda bir tavsiye niteliği taşımadığı gibi, tamamen içeriğe dayalı olarak yatırım yapılmamalı veya karar alınmamalıdır. Herhangi bir yatırım konulu karar almadan önce bir uzmandan görüş alınmalıdır. Sorumluluğun Sınırlandırılması: JetBorsa.com herhangi bir sınırlandırma olmaksızın, dolaylı, direkt veya bir fiilin sonucu olarak ortaya çıkan zararlar da dâhil olmak üzere her türlü kayıp ve hasarla ilgili sorumluluk kabul etmez.
          </p>
          <p className="text-xs text-primary-foreground/60 leading-relaxed mt-3">
            BIST isim ve logosu &quot;koruma marka belgesi&quot; altında korunmakta olup izinsiz kullanılamaz, iktibas edilemez, değiştirilemez. BIST ismi altında açıklanan tüm bilgilerin telif hakları tamamen BIST&apos;e ait olup, tekrar yayınlanamaz.
          </p>
        </div>
      </div>
    </footer>
  )
}
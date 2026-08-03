import { Logo } from "@/components/layout/Logo"
import { Marquee } from "@/components/shadcn-space/animations/marquee"
import { Separator } from "@/components/ui/separator"

interface ExternalCTAProps {
  videoSrc?: string
  tagline?: string
  title?: string
  ctaLabel?: string
  ctaHref?: string
  marqueeItems?: Array<string>
}

const defaultMarqueeItems = [
  "Endeksler",
  "Şirketler",
  "Teknik Analiz",
  "Temel Analiz",
  "Sektör Analizi",
  "Şirket Finansal Skoru",
  "Şirket Karşılaştırma",
  "AI Sohbet",
  "Haberler",
  "KAP Bildirimleri",
  "Piyasa Raporları",
  "Sektör ve Şirket Raporları",
  "Analist Yorumları",
  "Aracı Kurum Değerlendirmeleri",
  "Mali Tablo Analizi",
  "ve çok daha fazlası",
]

export function ExternalCTA({
  videoSrc = "https://videos.pexels.com/video-files/5226462/5226462-hd_1920_1080_30fps.mp4",
  tagline = "BIST Uzmanı Tek Yapay Zeka",
  title = "BIST Uzmanı Yapay Zeka ile Borsayı Derinlemesine Analiz Edin.",
  ctaLabel = "Ücretsiz Deneyin",
  ctaHref = "https://jetborsa.com",
  marqueeItems = defaultMarqueeItems,
}: ExternalCTAProps) {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-16 sm:py-20">
        <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-t-2xl bg-black/30">
          <video
            className="absolute top-0 left-0 -z-10 h-full w-full object-cover"
            autoPlay
            loop
            muted
            aria-label="Video background"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 -z-[5] bg-black/40" />

          <div className="h-full w-full px-6 py-16 sm:px-10">
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-5 py-2 backdrop-blur-sm">
                <Logo size={18} variant="icon" />
                <span className="text-sm font-bold tracking-wide text-white">
                  JetBorsa
                </span>
                <Separator
                  orientation="vertical"
                  className="h-4! w-px bg-white/25"
                />
                <span className="text-[11px] font-bold tracking-widest text-white/70 uppercase">
                  {tagline}
                </span>
              </div>

              <h2 className="max-w-2xl text-center text-3xl font-medium text-white sm:text-4xl">
                {title}
              </h2>

              <a
                href={ctaHref}
                className="rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-white duration-300 hover:opacity-90"
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
        <div className="w-full overflow-hidden rounded-b-2xl border-t border-black/5 bg-teal-400 py-4">
          <Marquee
            className="p-0 [--duration:40s] [--gap:1.25rem]"
            pauseOnHover
          >
            {marqueeItems.map((item, index) => (
              <div key={index} className="flex items-center gap-6">
                <p className="text-sm whitespace-nowrap text-gray-950">
                  {item}
                </p>
                <Separator className="w-8! bg-gray-950" />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}

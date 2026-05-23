import { createFileRoute } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

export const Route = createFileRoute('/panel/')({
  component: PanelIndexPage,
})

function PanelIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] h-full text-center p-6 max-w-lg mx-auto space-y-4 select-none animate-in fade-in duration-500">
      <div className="w-12 h-12 rounded-2xl bg-[#0e75ec]/10 flex items-center justify-center border border-[#0e75ec]/20 text-[#0e75ec]">
        <Sparkles size={20} />
      </div>
      <h2 className="text-base font-bold text-foreground tracking-tight">HissePro Finansal Analiz Asistanı</h2>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
        Yapay zeka desteğiyle BIST verilerini, bilançoları ve borsa gündemini analiz edin. Başlamak için soldaki takip listesinden bir hisse seçebilir veya aşağıdaki alandan doğrudan sorunuzu sorabilirsiniz.
      </p>
    </div>
  )
}

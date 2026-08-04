import { Eye } from 'lucide-react'

interface ChartOverlayProps {
  onClick: () => void
  className?: string
}

export function ChartOverlay({ onClick, className }: ChartOverlayProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex min-h-[300px] md:aspect-video md:min-h-0 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-muted/20 transition-all hover:border-primary/30 hover:bg-muted/30 cursor-pointer ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
        <Eye className="text-primary transition-transform group-hover:scale-110" size={22} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-foreground">Grafikleri Yükle</span>
        <span className="text-xs text-muted-foreground">Tarihsel candlestick verisi</span>
      </div>
    </button>
  )
}

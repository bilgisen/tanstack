import { Compass, Bookmark, Search, ArrowRightLeft, Sliders } from 'lucide-react'
import type { CapabilityAction } from '../../lib/pageContextSuggestions'

interface CapabilitiesSectionProps {
  capabilities?: CapabilityAction[]
  onSelect: (prompt: string) => void
}

const iconMap = {
  watchlist: Bookmark,
  deep_search: Search,
  compare: ArrowRightLeft,
  scan: Sliders
}

export function CapabilitiesSection({ capabilities, onSelect }: CapabilitiesSectionProps) {
  if (!capabilities || capabilities.length === 0) return null

  return (
    <div className="mt-5 pt-4 border-t border-border/15 text-left w-full animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
        <Compass size={12} className="text-primary shrink-0" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Neler yapabileceğinizi keşfedin
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {capabilities.map((cap) => {
          const IconComponent = iconMap[cap.icon] || Compass
          return (
            <button
              key={cap.id}
              onClick={() => onSelect(cap.prompt)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/15 hover:bg-primary/10 border border-border/25 hover:border-primary/30 transition-all duration-200 text-left group active:scale-[0.98] cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-background border border-border/30 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 shrink-0 transition-colors">
                <IconComponent size={12} />
              </div>
              <span className="text-xs font-medium text-foreground/80 group-hover:text-primary transition-colors truncate">
                {cap.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

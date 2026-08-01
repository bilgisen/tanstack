import { ArrowRightLeft, Bookmark, Compass, Search, Sliders } from 'lucide-react'
import type { CapabilityAction } from '../../lib/pageContextSuggestions'

interface CapabilitiesSectionProps {
  capabilities?: Array<CapabilityAction>
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
    <div className="mt-3 pt-3 border-t border-border/15 w-full animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 mb-2">
        <Compass size={11} className="text-primary shrink-0" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Neler yapabileceğinizi keşfedin
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {capabilities.map((cap) => {
          const IconComponent = iconMap[cap.icon] || Compass
          return (
            <button
              key={cap.id}
              onClick={() => onSelect(cap.prompt)}
              className="flex items-center gap-2 text-sm text-left text-muted-foreground hover:text-primary transition-colors cursor-pointer py-0.5 -ml-0.5 px-0.5 rounded hover:bg-muted/10"
            >
              <IconComponent size={11} className="shrink-0" />
              <span className="truncate">{cap.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

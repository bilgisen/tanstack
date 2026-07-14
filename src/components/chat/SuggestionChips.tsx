import { Sparkles } from 'lucide-react'

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (text: string) => void
  max?: number
}

export function SuggestionChips({ suggestions, onSelect, max = 3 }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null

  const items = suggestions.slice(0, max)

  return (
    <div className="mt-4 pt-3 border-t border-border/10">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles size={11} className="text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bunları da İnceleyin</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-muted/20 hover:bg-primary/10 hover:text-primary border border-border/20 hover:border-primary/30 transition-all duration-200 text-muted-foreground font-medium active:scale-95"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

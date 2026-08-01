import { Sparkles } from 'lucide-react'

interface SuggestionChipsProps {
  suggestions: Array<string>
  onSelect: (text: string) => void
  max?: number
}

export function SuggestionChips({ suggestions, onSelect, max = 3 }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null

  const items = suggestions.slice(0, max)

  return (
    <div className="pt-0">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-primary shrink-0" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bunları da İnceleyin</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="text-sm text-left text-muted-foreground hover:text-primary transition-colors cursor-pointer py-0.5 -ml-0.5 px-0.5 rounded hover:bg-muted/10"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

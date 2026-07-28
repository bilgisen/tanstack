import { useCompFaReport } from '../../lib/useCompData'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface AiReportProps {
  ticker: string
}

function renderContent(content: string): (string | { type: 'badge'; code: string })[] {
  const parts: (string | { type: 'badge'; code: string })[] = []
  const regex = /\[inline_ratio:(\w+)\]/g
  let lastIdx = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIdx) parts.push(content.slice(lastIdx, match.index))
    parts.push({ type: 'badge', code: match[1] })
    lastIdx = match.index + match[0].length
  }
  if (lastIdx < content.length) parts.push(content.slice(lastIdx))
  return parts
}

const SECTION_ICONS: Record<string, string> = {
  sentez: '🔍', degerleme: '💎', karlilik: '📈', saglamlik: '🛡️', izlenecekler: '🎯',
}

export function AiReport({ ticker }: AiReportProps) {
  const { data: report, isLoading } = useCompFaReport(ticker)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-20 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-20 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-20 w-full bg-muted/20 rounded-2xl animate-pulse" />
        <div className="h-20 w-full bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!report || !report.sections?.length) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        AI raporu oluşturulamadı.
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Section accordion */}
      {report.sections.map((section) => {
        const isOpen = openSections[section.id] !== false
        const icon = SECTION_ICONS[section.id] || '📄'

        return (
          <div key={section.id} className="border border-border/20 rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/5 transition-colors"
            >
              <span className="text-base">{icon}</span>
              <span className="text-sm font-bold text-foreground flex-1">{section.title}</span>
              {isOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {renderContent(section.content).map((part, i) => {
                    if (typeof part === 'string') {
                      return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
                    }
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 text-[11px] font-mono font-bold rounded bg-primary/10 text-primary border border-primary/20 cursor-help" title={part.code}>
                        {part.code}
                      </span>
                    )
                  })}
                </div>

                {section.signals_used.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {section.signals_used.map((sid) => (
                      <span key={sid} className="text-[10px] px-1.5 py-0.5 rounded border text-muted-foreground border-border/30 bg-muted/5">
                        {sid.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}


    </div>
  )
}

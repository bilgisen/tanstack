import { Sparkles } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useUIStore } from '../../store/ui'

interface ChatStarterProps {
  questions: Array<string>
  title?: string
  max?: number
  onOpenMobileChat?: () => void
}

/**
 * Main-area chat starter badges. Clicking one opens the chatbot (desktop
 * right sidebar or mobile sheet) and sends the question via globalPrompt.
 */
export function ChatStarter({ questions, title = "Yapay Zekâya Sor", max = 4, onOpenMobileChat }: ChatStarterProps) {
  const { isLoading } = useChatStore()
  const { setGlobalPrompt, openRightSidebar } = useUIStore()

  if (questions.length === 0) return null

  const handleSelect = (q: string) => {
    if (isLoading) return
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    if (isMobile) {
      if (onOpenMobileChat) onOpenMobileChat()
    } else {
      openRightSidebar()
    }
    // Must run after the sheet/sidebar open state so the mounted ChatPane consumes it
    setGlobalPrompt(q)
  }

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={13} className="text-primary shrink-0" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.slice(0, max).map((q, i) => (
          <button
            key={i}
            onClick={() => handleSelect(q)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15 transition-colors cursor-pointer active:scale-95"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

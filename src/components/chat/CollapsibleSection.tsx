import {  useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type {ReactNode} from 'react';

interface CollapsibleSectionProps {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  badge?: string
}

export function CollapsibleSection({ title, icon, defaultOpen = false, children, badge }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border/20 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-muted/10 hover:bg-muted/20 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
          <span className="text-xs font-semibold text-foreground truncate">{title}</span>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold shrink-0">{badge}</span>
          )}
        </div>
        {open ? <ChevronDown size={13} className="shrink-0 text-muted-foreground" /> : <ChevronRight size={13} className="shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-border/10">
          {children}
        </div>
      )}
    </div>
  )
}

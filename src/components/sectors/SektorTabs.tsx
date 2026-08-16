import { Link } from '@tanstack/react-router'
import { Bell, Info } from 'lucide-react'

const TABS = [
  { suffix: '', label: 'Genel Bakış', icon: Info },
  { suffix: '/bildirimler', label: 'KAP', icon: Bell },
]

export function SektorTabs({ basePath }: { basePath: string }) {
  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mt-1">
      {TABS.map((tab) => {
        const to = tab.suffix === '' ? basePath : `${basePath}${tab.suffix}`
        return (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: tab.suffix === '' }}
            activeProps={{ className: 'bg-primary text-primary-foreground border border-primary shadow-sm' }}
            inactiveProps={{ className: 'text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/60 bg-transparent' }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
          >
            <tab.icon size={14} />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

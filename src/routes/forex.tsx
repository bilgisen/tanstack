import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forex')({
  component: ForexPage,
})

function ForexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Forex Piyasaları</h1>
        <p className="text-sm text-zinc-400">Canlı döviz kurları ve pariteler.</p>
      </div>
      <div className="h-[600px] bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-zinc-500 font-medium">Forex Veri Tablosu ve Grafikler</span>
      </div>
    </div>
  )
}

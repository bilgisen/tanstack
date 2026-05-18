import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/borsa')({
  component: BorsaPage,
})

function BorsaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Borsa (Hisse Senetleri)</h1>
        <p className="text-sm text-zinc-400">BIST 100, BIST 30 ve global hisse senetleri.</p>
      </div>
      <div className="h-[600px] bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-zinc-500 font-medium">Borsa Veri Tablosu ve Grafikler</span>
      </div>
    </div>
  )
}

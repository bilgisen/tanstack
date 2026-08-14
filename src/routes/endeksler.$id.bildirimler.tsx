import { createFileRoute } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { getIndexName } from '../constants/bistIndices'
import { KAPFeedSkeleton, NotificationCard } from '../components/kap/NotificationCard'
import { useKAPFeed } from '../lib/useKAPData'

export const Route = createFileRoute('/endeksler/$id/bildirimler')({
  component: EndeksBildirimlerPage,
})

function EndeksBildirimlerPage() {
  const { id } = Route.useParams()
  const code = id.toUpperCase()
  const indexName = getIndexName(code) || code

  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isFetching } = useKAPFeed({
    index: code,
    page,
    limit: 25,
  })

  const notifications = data?.notifications ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 25))

  return (
    <div className="space-y-5 animate-in fade-in duration-400 max-w-5xl mx-auto py-2">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Bell size={14} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
            {indexName} Bildirimleri
          </h2>
          <p className="text-xs text-muted-foreground">
            Endeks üyelerinin KAP bildirimleri
            {data && !isLoading && (
              <span className="ml-1 text-muted-foreground/70">· {data.total} bildirim</span>
            )}
          </p>
        </div>
      </div>

      {isLoading && <KAPFeedSkeleton count={4} />}

      {isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-muted-foreground">
          Bildirimler yüklenirken bir sorun oluştu.
        </div>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <div className="rounded-2xl border border-border/60 p-10 text-center text-sm text-muted-foreground">
          Bu endeks için kayıtlı KAP bildirimi bulunamadı.
        </div>
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <>
          <div className="grid gap-3">
            {notifications.map(n => (
              <NotificationCard key={n.disclosure_index} n={n} isImportant={(n.importance_score ?? 0) >= 7} />
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground/70">
              {data?.total ?? 0} bildirim · Sayfa {page}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40 hover:border-primary/40 transition-colors"
              >
                ← Önceki
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages || isFetching}
                className="rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40 hover:border-primary/40 transition-colors"
              >
                Sonraki →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
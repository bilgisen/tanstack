import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export const Route = createFileRoute('/panel')({
  component: PanelLayout,
})

function PanelLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/' })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-muted-foreground animate-pulse">
        Yükleniyor...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <Outlet />
}

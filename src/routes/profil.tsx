import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import { Logo } from '../components/layout/Logo'

export const Route = createFileRoute('/profil')({
  component: ProtectedProfileLayout,
})

function ProtectedProfileLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/' })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Logo size={42} variant="icon" className="animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <Outlet />
}

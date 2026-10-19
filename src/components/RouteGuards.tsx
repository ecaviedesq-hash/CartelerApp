import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth.ts'

export function Splash() {
  return (
    <main className="splash">
      <span className="brand-mark" aria-hidden="true" />
      <p>Comprobando tu sesión…</p>
    </main>
  )
}

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  if (loading) return <Splash />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

export function GuestRoute() {
  const { session, loading } = useAuth()
  if (loading) return <Splash />
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}

export function FallbackRedirect() {
  const { session, loading } = useAuth()
  if (loading) return <Splash />
  return <Navigate to={session ? '/' : '/login'} replace />
}

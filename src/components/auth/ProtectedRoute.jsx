import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Crown } from 'lucide-react'

export function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C0D06]">
        <div className="flex flex-col items-center gap-3">
          <Crown size={28} className="text-gold animate-pulse" />
          <p className="text-cream/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { user, isLoggedIn, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C0D06]">
        <Crown size={28} className="text-gold animate-pulse" />
      </div>
    )
  }

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return children
}

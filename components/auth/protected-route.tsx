'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
// import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
children: React.ReactNode
redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
const { isAuthenticated, loading } = useAuth()
const router = useRouter()

useEffect(() => {
  if (!loading && !isAuthenticated) {
    router.push(redirectTo)
  }
}, [isAuthenticated, loading, router, redirectTo])

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {/* <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" /> */}
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

if (!isAuthenticated) {
  return null
}

return <>{children}</>
}
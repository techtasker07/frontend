"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

interface LoginSuccessHandlerProps {
  onLoginSuccess?: () => void
}

export function LoginSuccessHandler({ onLoginSuccess }: LoginSuccessHandlerProps) {
  const router = useRouter()
  const { user, isAuthenticated, justLoggedIn, setJustLoggedIn } = useAuth()

  useEffect(() => {
    // Check if user just logged in
    if (isAuthenticated && user && justLoggedIn) {
      setJustLoggedIn(false) // Reset the flag
      onLoginSuccess?.()
      // Navigate directly to the welcome back page
      router.push("/ai/welcome-back")
    }
  }, [isAuthenticated, user, justLoggedIn, setJustLoggedIn, onLoginSuccess, router])

  if (!isAuthenticated || !user) {
    return null
  }

  // No UI needed - just handles navigation
  return null
}

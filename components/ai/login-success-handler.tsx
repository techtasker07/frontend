"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export function LoginSuccessHandler() {
  const { justLoggedIn, setJustLoggedIn, isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only trigger if user just logged in and is authenticated
    if (justLoggedIn && isAuthenticated && user) {
      // Clear the justLoggedIn flag to prevent retriggering
      setJustLoggedIn(false)
      
      // Small delay to ensure the state is properly set
      setTimeout(() => {
        // Navigate to the AI prospect welcome page
        router.push("/ai/welcome-back")
      }, 100)
    }
  }, [justLoggedIn, isAuthenticated, user, router, setJustLoggedIn])

  // This component doesn't render anything visible
  return null
}

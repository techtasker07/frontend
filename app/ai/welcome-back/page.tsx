"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { WelcomeBackPage } from "@/components/ai/welcome-back-page"
import { toast } from "sonner"

export default function AIWelcomeBackPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    router.push("/login")
    return null
  }

  const handleStartAnalysis = () => {
    router.push("/ai/capture-image?fromLogin=true")
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const handleClose = () => {
    router.push("/dashboard")
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <WelcomeBackPage
      userName={user.first_name || "User"}
      onStartAnalysis={handleStartAnalysis}
      onSkip={handleSkip}
      onClose={handleClose}
    />
  )
}

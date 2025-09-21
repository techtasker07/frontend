"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { WelcomeBackPage } from "@/components/ai/welcome-back-page"

export default function AIWelcomeBackPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

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

  return (
    <WelcomeBackPage
      userName={user.first_name || "User"}
      onStartAnalysis={handleStartAnalysis}
      onSkip={handleSkip}
      onClose={handleClose}
    />
  )
}

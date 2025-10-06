"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import WelcomeBackPageProps from "@/components/ai/welcome-back-page"
import { AIProspectFlowController } from "@/components/ai/ai-prospect-flow-controller"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

export default function AIWelcomeBackPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showAIFlow, setShowAIFlow] = useState(false)
  
  const handleStartAnalysis = () => {
    setShowAIFlow(true)
  }
  
  const handleSkip = () => {
    router.push('/dashboard')
  }
  
  const handleClose = () => {
    router.push('/dashboard')
  }
  
  const handleAIFlowComplete = (results: any) => {
    toast.success("Property analysis completed! Review your results below.")
    // Don't navigate away - let user close results page themselves
  }
  
  const handleAIFlowCancel = () => {
    router.push('/dashboard')
  }
  
  // Show AI flow if user clicked camera
  if (showAIFlow) {
    return (
      <ProtectedRoute>
        <AIProspectFlowController
          key="ai-flow"
          initialStep="camera"
          onComplete={handleAIFlowComplete}
          onCancel={handleAIFlowCancel}
        />
      </ProtectedRoute>
    )
  }
  
  return (
    <WelcomeBackPageProps
      userName={user?.first_name || user?.email?.split('@')[0] || "Guest"}
      onStartAnalysis={handleStartAnalysis}
      onSkip={handleSkip}
      onClose={handleClose}
    />
  );
}

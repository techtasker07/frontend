"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WelcomeBackPage } from "@/components/ai/welcome-back-page"
import { AIProspectFlowController } from "@/components/ai/ai-prospect-flow-controller"
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
    toast.success("Property analysis completed! Check your dashboard for results.")
    router.push('/dashboard')
  }
  
  const handleAIFlowCancel = () => {
    setShowAIFlow(false)
  }
  
  // Show AI flow if user clicked camera
  if (showAIFlow) {
    return (
      <AIProspectFlowController
        key="ai-flow"
        initialStep="camera"
        onComplete={handleAIFlowComplete}
        onCancel={handleAIFlowCancel}
      />
    )
  }
  
  return (
    <WelcomeBackPage
      userName={user?.first_name || user?.email?.split('@')[0] || "Guest"}
      onStartAnalysis={handleStartAnalysis}
      onSkip={handleSkip}
      onClose={handleClose}
    />
  );
}

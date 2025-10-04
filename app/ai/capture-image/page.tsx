"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { toast } from "sonner"


// Dynamically import AdvancedImageCapture to avoid SSR issues with OpenCV.js
const AdvancedImageCapture = dynamic(() => import("@/components/camera/advanced-image-capture").then(mod => ({ default: mod.AdvancedImageCapture })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-700 font-medium">Loading advanced image capture...</p>
        <p className="text-purple-600 text-sm">Initializing AI-powered features</p>
      </div>
    </div>
  )
})

function AICaptureImagePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromLogin = searchParams.get('fromLogin') === 'true'
  const [loading, setLoading] = useState(false)


  const handleClose = () => {
    // Clear any stored data
    sessionStorage.removeItem("ai-prospects")
    sessionStorage.removeItem("ai-prospect-image")
    sessionStorage.removeItem("selected-prospect")
    router.push("/dashboard")
  }

  const handleBack = () => {
    // Go back to welcome page if coming from login
    if (fromLogin) {
      router.push("/ai/welcome-back")
    } else {
      // Otherwise go to dashboard
      router.push("/dashboard")
    }
  }

  const handleBackToWelcome = () => {
    router.push("/ai/welcome-back")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <AdvancedImageCapture
      onClose={handleClose}
      onBack={handleBack}
      onBackToWelcome={handleBackToWelcome}
      onImageCaptured={() => {}} // Dummy function since it's not used
      fromLogin={fromLogin}
      autoStartCamera={fromLogin} // Auto-start camera when coming from login flow
    />
  )
}

export default function AICaptureImagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <AICaptureImagePageContent />
    </Suspense>
  )
}

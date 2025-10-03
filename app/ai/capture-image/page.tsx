"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { toast } from "sonner"

import { generatePropertyDetails, generateSmartProspects, type IdentifiedCategory, performSmartAnalysis } from "@/lib/smartProspectGenerator"

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

  const handleImageCaptured = async (file: File, identifiedCategory?: IdentifiedCategory) => {
    try {
      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file)
      
      // Check if we have a valid category that's not a human
      if (identifiedCategory && identifiedCategory.name === 'human') {
        // If it's a human image, it's already handled in the ImageCapturePage component
        // Just clean up the URL and return without navigating
        URL.revokeObjectURL(imageUrl)
        return
      }
      
      // Use identified category or fallback to 'building'
      const category = identifiedCategory || { name: 'building', confidence: 0.75 }
      
      // Generate property details and smart prospects
      const propertyDetails = generatePropertyDetails(category.name)
      const smartProspects = generateSmartProspects(category, propertyDetails)
      
      // Store data in sessionStorage for navigation
      sessionStorage.setItem("ai-prospects", JSON.stringify(smartProspects))
      sessionStorage.setItem("ai-prospect-image", imageUrl)
      sessionStorage.setItem("property-details", JSON.stringify(propertyDetails))
      sessionStorage.setItem("identified-category", JSON.stringify(category))
      
      // Navigate to prospect preview page immediately
      router.push("/ai/prospect-preview")
    } catch (error) {
      console.error("Failed to process image:", error)
      toast.error("Failed to analyze the image")
    }
  }

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
      onImageCaptured={handleImageCaptured}
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

"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ImageCapturePage } from "@/components/ai/image-capture-page"
import { toast } from "sonner"

import { generatePropertyDetails, generateSmartProspects, type IdentifiedCategory } from "@/lib/smartProspectGenerator"

function AICaptureImagePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromLogin = searchParams.get('fromLogin') === 'true'
  const [loading, setLoading] = useState(false)

  const handleImageCaptured = async (file: File, identifiedCategory?: IdentifiedCategory) => {
    try {
      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file)
      
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
    <ImageCapturePage
      onClose={handleClose}
      onBack={handleBack}
      onImageCaptured={handleImageCaptured}
      fromLogin={fromLogin}
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

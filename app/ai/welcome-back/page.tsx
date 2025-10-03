"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { WelcomeBackPage } from "@/components/ai/welcome-back-page"
import { generatePropertyDetails, generateSmartProspects, type IdentifiedCategory } from "@/lib/smartProspectGenerator"
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

  const handleImageCaptured = async (file: File, identifiedCategory?: IdentifiedCategory) => {
    try {
      setLoading(true)
      
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
    } finally {
      setLoading(false)
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
    <WelcomeBackPage
      userName={user.first_name || "User"}
      onStartAnalysis={handleStartAnalysis}
      onSkip={handleSkip}
      onClose={handleClose}
      onImageCaptured={handleImageCaptured}
    />
  )
}

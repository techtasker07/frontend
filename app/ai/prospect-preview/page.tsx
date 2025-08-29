"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SmartProspectPreviewPage } from "@/components/ai/smart-prospect-preview-page"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { SmartProspect, IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface PropertyDetails {
  title: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
}

function AIProspectPreviewPageContent() {
  const router = useRouter()
  const [prospects, setProspects] = useState<SmartProspect[]>([])
  const [imageUrl, setImageUrl] = useState<string>("")
  const [identifiedCategory, setIdentifiedCategory] = useState<IdentifiedCategory | null>(null)
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)

  useEffect(() => {
    // Get data from sessionStorage (set when navigating from image capture)
    const storedProspects = sessionStorage.getItem("ai-prospects")
    const storedImageUrl = sessionStorage.getItem("ai-prospect-image")
    const storedPropertyDetails = sessionStorage.getItem("property-details")
    const storedCategory = sessionStorage.getItem("identified-category")

    if (storedProspects && storedImageUrl && storedPropertyDetails && storedCategory) {
      setProspects(JSON.parse(storedProspects))
      setImageUrl(storedImageUrl)
      setPropertyDetails(JSON.parse(storedPropertyDetails))
      setIdentifiedCategory(JSON.parse(storedCategory))
    } else {
      // If no data found, redirect back to dashboard
      toast.error("No prospect data found. Please start the analysis again.")
      router.push("/dashboard")
      return
    }
  }, [router])

  const handleClose = () => {
    // Clear all session data and go back to dashboard
    sessionStorage.removeItem("ai-prospects")
    sessionStorage.removeItem("ai-prospect-image")
    sessionStorage.removeItem("property-details")
    sessionStorage.removeItem("identified-category")
    sessionStorage.removeItem("selected-prospect")
    router.push("/dashboard")
  }

  const handleRetakeImage = () => {
    // Clear session data and go back to image capture
    sessionStorage.removeItem("ai-prospects")
    sessionStorage.removeItem("ai-prospect-image")
    sessionStorage.removeItem("property-details")
    sessionStorage.removeItem("identified-category")
    sessionStorage.removeItem("selected-prospect")
    router.push("/ai/capture-image?fromLogin=false")
  }

  const handleSelectProspect = (prospect: SmartProspect) => {
    // Store the selected prospect and navigate to details page
    sessionStorage.setItem("selected-prospect", JSON.stringify(prospect))
    router.push(`/ai/prospect-details/${prospect.id}`)
  }

  // Return early if data is not ready
  if (!prospects.length || !imageUrl || !identifiedCategory || !propertyDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading prospects...</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <SmartProspectPreviewPage
      imageUrl={imageUrl}
      prospects={prospects}
      identifiedCategory={identifiedCategory}
      propertyDetails={propertyDetails}
      onClose={handleClose}
      onRetakeImage={handleRetakeImage}
      onSelectProspect={handleSelectProspect}
    />
  )
}

export default function AIProspectPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <AIProspectPreviewPageContent />
    </Suspense>
  )
}

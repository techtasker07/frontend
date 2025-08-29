"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { SmartProspectDetailsPage } from "@/components/ai/smart-prospect-details-page"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { SmartProspect, IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface PropertyDetails {
  title: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
}

export default function AIProspectDetailsPageRoute() {
  const router = useRouter()
  const params = useParams()
  const prospectId = params.prospectId as string
  
  const [prospect, setProspect] = useState<SmartProspect | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [identifiedCategory, setIdentifiedCategory] = useState<IdentifiedCategory | null>(null)
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get data from sessionStorage
    const storedProspect = sessionStorage.getItem("selected-prospect")
    const storedImageUrl = sessionStorage.getItem("ai-prospect-image")
    const storedPropertyDetails = sessionStorage.getItem("property-details")
    const storedCategory = sessionStorage.getItem("identified-category")
    const storedProspects = sessionStorage.getItem("ai-prospects")

    if (storedProspect && storedImageUrl && storedPropertyDetails && storedCategory) {
      const prospectData = JSON.parse(storedProspect)
      setProspect(prospectData)
      setImageUrl(storedImageUrl)
      setPropertyDetails(JSON.parse(storedPropertyDetails))
      setIdentifiedCategory(JSON.parse(storedCategory))
    } else if (storedProspects && storedImageUrl && storedPropertyDetails && storedCategory) {
      // Fallback: find prospect from all prospects
      const allProspects = JSON.parse(storedProspects)
      const foundProspect = allProspects.find((p: SmartProspect) => p.id === parseInt(prospectId))
      if (foundProspect) {
        setProspect(foundProspect)
        setImageUrl(storedImageUrl)
        setPropertyDetails(JSON.parse(storedPropertyDetails))
        setIdentifiedCategory(JSON.parse(storedCategory))
        sessionStorage.setItem("selected-prospect", JSON.stringify(foundProspect))
      } else {
        toast.error("Prospect not found. Please start the analysis again.")
        router.push("/dashboard")
        return
      }
    } else {
      toast.error("No prospect data found. Please start the analysis again.")
      router.push("/dashboard")
      return
    }

    setLoading(false)
  }, [prospectId, router])

  const handleBack = () => {
    // Go back to preview page
    router.push("/ai/prospect-preview")
  }

  const handleClose = () => {
    // Clear all session data and go back to dashboard
    sessionStorage.removeItem("ai-prospects")
    sessionStorage.removeItem("ai-prospect-image")
    sessionStorage.removeItem("property-details")
    sessionStorage.removeItem("identified-category")
    sessionStorage.removeItem("selected-prospect")
    router.push("/dashboard")
  }

  const handleAddProperty = () => {
    if (prospect) {
      // Navigate to the full-page add prospect form
      router.push(`/ai/add-prospect?prospectId=${prospect.id}`)
    }
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Return early if data is not ready
  if (!prospect || !imageUrl || !identifiedCategory || !propertyDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading prospect details...</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <SmartProspectDetailsPage
      prospect={prospect}
      imageUrl={imageUrl}
      identifiedCategory={identifiedCategory}
      propertyDetails={propertyDetails}
      onBack={handleBack}
      onClose={handleClose}
      onAddProperty={handleAddProperty}
      onRetakeImage={handleRetakeImage}
    />
  )
}

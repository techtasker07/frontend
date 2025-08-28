"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProspectDetailsPage } from "@/components/ai/prospect-details-page"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface ProspectPreview {
  title: string
  description: string
  estimatedCost: number
  totalCost: number
  imageUrl?: string
}

interface ProspectData {
  id: number
  categoryId: string | number // Support both string (new UUID) and number (old integer) for backwards compatibility
  categoryName: string
  propertyTitle: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
  prospect: ProspectPreview
}

export default function AIProspectDetailsPageRoute() {
  const router = useRouter()
  const params = useParams()
  const prospectId = parseInt(params.prospectId as string)
  
  const [prospect, setProspect] = useState<ProspectData | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get data from sessionStorage
    const storedProspect = sessionStorage.getItem("selected-prospect")
    const storedImageUrl = sessionStorage.getItem("ai-prospect-image")
    const storedProspects = sessionStorage.getItem("ai-prospects")

    if (storedProspect && storedImageUrl) {
      const prospectData = JSON.parse(storedProspect)
      setProspect(prospectData)
      setImageUrl(storedImageUrl)
    } else if (storedProspects && storedImageUrl) {
      // Fallback: find prospect from all prospects
      const allProspects = JSON.parse(storedProspects)
      const foundProspect = allProspects.find((p: ProspectData) => p.id === prospectId)
      if (foundProspect) {
        setProspect(foundProspect)
        setImageUrl(storedImageUrl)
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
    // Keep session data but go back to image capture
    router.push("/ai/capture-image?fromLogin=false")
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!prospect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Prospect not found</h2>
          <p className="text-muted-foreground mb-4">Please start the analysis again.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProspectDetailsPage
        prospect={prospect}
        imageUrl={imageUrl}
        onBack={handleBack}
        onClose={handleClose}
        onAddProperty={handleAddProperty}
        onRetakeImage={handleRetakeImage}
      />

    </>
  )
}

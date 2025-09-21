"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AddProspectPage } from "@/components/ai/add-prospect-page"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { SmartProspect, IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface PropertyDetails {
  title: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
}

interface ProspectFormData {
  title: string
  description: string
  location: string
  estimatedWorth: string
  yearOfConstruction: string
}

function AIAddProspectPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prospectId = searchParams.get('prospectId')
  
  const [prospect, setProspect] = useState<SmartProspect | null>(null)
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)
  const [identifiedCategory, setIdentifiedCategory] = useState<IdentifiedCategory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get data from sessionStorage
    const storedProspect = sessionStorage.getItem("selected-prospect")
    const storedPropertyDetails = sessionStorage.getItem("property-details")
    const storedCategory = sessionStorage.getItem("identified-category")
    const storedProspects = sessionStorage.getItem("ai-prospects")

    if (storedProspect && storedPropertyDetails && storedCategory) {
      const prospectData = JSON.parse(storedProspect)
      setProspect(prospectData)
      setPropertyDetails(JSON.parse(storedPropertyDetails))
      setIdentifiedCategory(JSON.parse(storedCategory))
    } else if (storedProspects && storedPropertyDetails && storedCategory && prospectId) {
      // Fallback: find prospect from all prospects
      const allProspects = JSON.parse(storedProspects)
      const foundProspect = allProspects.find((p: SmartProspect) => p.id === parseInt(prospectId))
      if (foundProspect) {
        setProspect(foundProspect)
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
    if (prospect) {
      // Go back to prospect details page
      router.push(`/ai/prospect-details/${prospect.id}`)
    } else {
      // Fallback to preview page
      router.push("/ai/prospect-preview")
    }
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

  const handleFormSubmit = async (formData: ProspectFormData) => {
    if (!prospect || !identifiedCategory) return

    try {
      // Map smart prospect categories to Supabase UUID category IDs
      const categoryIdMapping: { [key: string]: string } = {
        'building': '550e8400-e29b-41d4-a716-446655440001', // Residential
        'room': '550e8400-e29b-41d4-a716-446655440001', // Residential
        'office space': '550e8400-e29b-41d4-a716-446655440002', // Commercial
        'land': '550e8400-e29b-41d4-a716-446655440003', // Land
        'material': '550e8400-e29b-41d4-a716-446655440004', // Industrial
      }

      // Use identified category to determine the correct category_id
      const categoryId = categoryIdMapping[identifiedCategory.name] || categoryIdMapping['building']

      // Create property data for Supabase
      const propertyData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category_id: categoryId,
        estimated_worth: formData.estimatedWorth ? parseFloat(formData.estimatedWorth) : undefined,
        year_of_construction: formData.yearOfConstruction ? parseInt(formData.yearOfConstruction) : undefined,
        image_url: `https://picsum.photos/800/600?random=${Date.now()}`, // Placeholder for now
      }

      const response = await api.createProspectProperty(propertyData)

      if (response.success) {
        toast.success("Smart prospect property added successfully!")
        // Clear session storage and navigate to prospect properties
        sessionStorage.removeItem("ai-prospects")
        sessionStorage.removeItem("ai-prospect-image")
        sessionStorage.removeItem("property-details")
        sessionStorage.removeItem("identified-category")
        sessionStorage.removeItem("selected-prospect")
        router.push("/prospectProperties")
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to create property")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Return early if data is not ready
  if (!prospect || !propertyDetails || !identifiedCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading prospect data...</h2>
          <p className="text-muted-foreground mb-4">Please wait while we load your data.</p>
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
    <AddProspectPage
      onClose={handleClose}
      onBack={handleBack}
      onSubmit={handleFormSubmit}
      initialData={{
        title: propertyDetails.title,
        location: propertyDetails.location,
        estimatedWorth: propertyDetails.estimatedWorth,
        yearBuilt: propertyDetails.yearBuilt,
      }}
    />
  )
}

export default function AIAddProspectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <AIAddProspectPageContent />
    </Suspense>
  )
}

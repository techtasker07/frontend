"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AddProspectPage } from "@/components/ai/add-prospect-page"
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
  categoryId: string | number
  categoryName: string
  propertyTitle: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
  prospect: ProspectPreview
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
  
  const [prospect, setProspect] = useState<ProspectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get data from sessionStorage
    const storedProspect = sessionStorage.getItem("selected-prospect")
    const storedProspects = sessionStorage.getItem("ai-prospects")

    if (storedProspect) {
      const prospectData = JSON.parse(storedProspect)
      setProspect(prospectData)
    } else if (storedProspects && prospectId) {
      // Fallback: find prospect from all prospects
      const allProspects = JSON.parse(storedProspects)
      const foundProspect = allProspects.find((p: ProspectData) => p.id.toString() === prospectId)
      if (foundProspect) {
        setProspect(foundProspect)
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
    sessionStorage.removeItem("selected-prospect")
    router.push("/dashboard")
  }

  const handleFormSubmit = async (formData: ProspectFormData) => {
    if (!prospect) return

    try {
      // Map old integer category IDs to new Supabase UUID category IDs
      const categoryIdMapping: { [key: number]: string } = {
        1: '550e8400-e29b-41d4-a716-446655440001', // Residential
        2: '550e8400-e29b-41d4-a716-446655440002', // Commercial  
        3: '550e8400-e29b-41d4-a716-446655440003', // Land
        4: '550e8400-e29b-41d4-a716-446655440004', // Industrial
        5: '550e8400-e29b-41d4-a716-446655440005', // Materials
        6: '550e8400-e29b-41d4-a716-446655440006', // Mixed-Use
      }

      // Determine the correct category_id - handle both string (UUID) and number (old integer)
      let categoryId: string
      if (typeof prospect.categoryId === 'string') {
        // Already a UUID string from Supabase
        categoryId = prospect.categoryId
      } else {
        // Old integer ID, map to UUID
        categoryId = categoryIdMapping[prospect.categoryId] || categoryIdMapping[1] // Default to Residential
      }

      // Create property data for Supabase with correct UUID category_id
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
        toast.success("Prospect property added successfully!")
        // Clear session storage and navigate to prospect properties
        sessionStorage.removeItem("ai-prospects")
        sessionStorage.removeItem("ai-prospect-image")
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
    <AddProspectPage
      onClose={handleClose}
      onBack={handleBack}
      onSubmit={handleFormSubmit}
      initialData={{
        title: prospect.propertyTitle,
        location: prospect.location,
        estimatedWorth: prospect.estimatedWorth,
        yearBuilt: prospect.yearBuilt,
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

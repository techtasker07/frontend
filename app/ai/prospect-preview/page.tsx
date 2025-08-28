"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProspectPreviewPage } from "@/components/ai/prospect-preview-page"
import { api, type Category } from "@/lib/api"
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

function AIProspectPreviewPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allProspects, setAllProspects] = useState<ProspectData[]>([])
  const [selectedProspect, setSelectedProspect] = useState<ProspectData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageUrl, setImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get data from sessionStorage (set when navigating from image capture)
    const storedProspects = sessionStorage.getItem("ai-prospects")
    const storedImageUrl = sessionStorage.getItem("ai-prospect-image")
    const selectedId = searchParams.get("selected")

    if (storedProspects && storedImageUrl) {
      const prospects = JSON.parse(storedProspects)
      setAllProspects(prospects)
      setImageUrl(storedImageUrl)
      
      // Set selected prospect if ID is provided
      if (selectedId) {
        const prospect = prospects.find((p: ProspectData) => p.id.toString() === selectedId)
        if (prospect) {
          setSelectedProspect(prospect)
        }
      }
    } else {
      // If no data found, redirect back to dashboard or show error
      toast.error("No prospect data found. Please start the analysis again.")
      router.push("/dashboard")
      return
    }

    fetchCategories()
  }, [searchParams, router])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Clear session data and go back to dashboard
    sessionStorage.removeItem("ai-prospects")
    sessionStorage.removeItem("ai-prospect-image")
    sessionStorage.removeItem("selected-prospect")
    router.push("/dashboard")
  }

  const handleSelectProspect = (prospect: ProspectData) => {
    setSelectedProspect(prospect)
    // Update URL to reflect selection
    const params = new URLSearchParams(searchParams.toString())
    params.set("selected", prospect.id.toString())
    router.push(`/ai/prospect-preview?${params.toString()}`, { scroll: false })
  }

  const handleViewDetails = (prospect: ProspectData) => {
    // Store the selected prospect and navigate to details page
    sessionStorage.setItem("selected-prospect", JSON.stringify(prospect))
    router.push(`/ai/prospect-details/${prospect.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <ProspectPreviewPage
      onBack={handleBack}
      onSelectProspect={handleSelectProspect}
      onViewDetails={handleViewDetails}
      imageUrl={imageUrl}
      allProspects={allProspects}
      selectedProspect={selectedProspect}
      categories={categories}
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

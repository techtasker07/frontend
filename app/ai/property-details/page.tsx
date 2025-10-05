"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { toast } from "sonner"

// Dynamically import PropertyDetailsForm to avoid SSR issues
const PropertyDetailsForm = dynamic(() => import("@/components/ai/property-details-form").then(mod => ({ default: mod.PropertyDetailsForm })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-700 font-medium">Loading property details form...</p>
      </div>
    </div>
  )
})

function PropertyDetailsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get data from URL params (we'll pass them as query params)
  const imageUrl = searchParams.get('imageUrl') || ''
  const identifiedCategoryStr = searchParams.get('identifiedCategory')
  const propertyDetailsStr = searchParams.get('propertyDetails')
  const prospectsStr = searchParams.get('prospects')
  const userId = searchParams.get('userId') || ''

  let identifiedCategory = null
  let propertyDetails = null
  let prospects = []

  try {
    if (identifiedCategoryStr) {
      identifiedCategory = JSON.parse(decodeURIComponent(identifiedCategoryStr))
    }
    if (propertyDetailsStr) {
      propertyDetails = JSON.parse(decodeURIComponent(propertyDetailsStr))
    }
    if (prospectsStr) {
      prospects = JSON.parse(decodeURIComponent(prospectsStr))
    }
  } catch (error) {
    console.error('Error parsing data from URL:', error)
    toast.error('Invalid data. Please try again.')
    router.push('/ai/capture-image')
    return null
  }

  if (!imageUrl || !identifiedCategory || !propertyDetails || !userId) {
    toast.error('Missing required data. Please capture an image first.')
    router.push('/ai/capture-image')
    return null
  }

  const handleSeeProspects = (details: any) => {
    // Navigate back to capture page or dashboard, or show prospects
    // For now, navigate to dashboard
    router.push('/dashboard')
  }

  const handleBack = () => {
    router.push('/ai/capture-image')
  }

  return (
    <PropertyDetailsForm
      imageUrl={imageUrl}
      identifiedCategory={identifiedCategory}
      propertyDetails={propertyDetails}
      prospects={prospects}
      userId={userId}
      onSeeProspects={handleSeeProspects}
      onBack={handleBack}
    />
  )
}

export default function PropertyDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <PropertyDetailsPageContent />
    </Suspense>
  )
}
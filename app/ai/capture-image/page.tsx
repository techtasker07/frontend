"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ImageCapturePage } from "@/components/ai/image-capture-page"
import { api, type Category } from "@/lib/api"
import { toast } from "sonner"

import { generateCrossCategoryProspects } from "@/lib/aiProspects"

// Generate 5 random prospects from different categories using the aiProspects library
const generateMultipleCategoryProspects = (categories: Category[]) => {
  const locations = [
    "Victoria Island, Lagos",
    "Ikoyi, Lagos",
    "Lekki Phase 1, Lagos",
    "Abuja Central",
    "GRA, Port Harcourt",
    "New Haven, Enugu",
    "Bodija, Ibadan",
    "Asokoro, Abuja",
  ]

  const propertyTypes: { [key: string]: string[] } = {
    "Residential": ["Modern Apartment Complex", "Luxury Residential Building", "Executive Flat"],
    "Commercial": ["Commercial Plaza", "Office Complex", "Shopping Mall"],
    "Land": ["Undeveloped Land Plot", "Prime Development Site", "Investment Land"],
    "Industrial": ["Warehouse Facility", "Industrial Complex", "Manufacturing Plant"],
  }

  // Generate base property worth for calculations
  const basePrice = Math.floor(Math.random() * 50000000) + 10000000 // 10M to 60M Naira
  
  // Use the library function to get 5 cross-category prospects
  const crossCategoryProspects = generateCrossCategoryProspects(basePrice)
  
  // Map the prospects to our expected format with additional property details
  const allProspects = crossCategoryProspects.map((prospect, index) => {
    // Find matching category from our categories list
    const matchingCategory = categories.find(cat => {
      const categoryNameMap: { [key: string]: string } = {
        "residential": "Residential",
        "commercial": "Commercial",
        "industrial": "Industrial", 
        "agricultural": "Land", // Map agricultural back to Land
      }
      return categoryNameMap[prospect.category.toLowerCase()] === cat.name
    })
    
    const categoryId = matchingCategory?.id || categories[0]?.id || "1"
    const categoryName = matchingCategory?.name || "Residential"
    const titles = propertyTypes[categoryName] || propertyTypes["Residential"]
    const randomTitle = titles[Math.floor(Math.random() * titles.length)]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]
    const yearBuilt = Math.floor(Math.random() * 20) + 2005 // 2005-2024
    
    return {
      id: index + 1,
      categoryId,
      categoryName,
      propertyTitle: randomTitle,
      location: randomLocation,
      estimatedWorth: basePrice,
      yearBuilt: Math.random() > 0.3 ? yearBuilt : undefined,
      prospect: {
        title: prospect.title,
        description: prospect.description,
        estimatedCost: prospect.estimatedCost,
        totalCost: prospect.estimatedCost + basePrice, // Total = estimated cost + property worth
        imageUrl: prospect.imageUrl,
        realizationTips: prospect.realizationTips || [], // Include realization tips from library
      }
    }
  })
  
  return allProspects
}

function AICaptureImagePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromLogin = searchParams.get('fromLogin') === 'true'
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const handleImageCaptured = async (file: File) => {
    try {
      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file)
      
      // Generate 5 different prospects from multiple categories
      const generatedProspects = generateMultipleCategoryProspects(categories)
      
      // Store data in sessionStorage for navigation
      sessionStorage.setItem("ai-prospects", JSON.stringify(generatedProspects))
      sessionStorage.setItem("ai-prospect-image", imageUrl)
      
      // Navigate to prospect preview page
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

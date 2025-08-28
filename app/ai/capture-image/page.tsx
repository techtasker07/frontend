"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ImageCapturePage } from "@/components/ai/image-capture-page"
import { api, type Category } from "@/lib/api"
import { toast } from "sonner"

import { MOCK_PROSPECTS, type PropertyProspect } from "@/lib/aiProspects"

// Generate 5 random prospects from different categories using the updated aiProspects library
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

  // Map category names to prospect categories in the aiProspects library
  const categoryMap: { [key: string]: keyof typeof MOCK_PROSPECTS } = {
    "Residential": "residential",
    "Commercial": "commercial",
    "Land": "agricultural", // Land category maps to agricultural
    "Industrial": "industrial",
  }

  // Generate 5 different prospects from different categories using the aiProspects library
  const allProspects: any[] = []
  
  // Create a pool of all possible category-prospect combinations from the aiProspects library
  const availableCombinations: Array<{ categoryId: string, categoryName: string, prospect: PropertyProspect }> = []
  
  categories.forEach(category => {
    const categoryKey = categoryMap[category.name] || "residential"
    const prospects = MOCK_PROSPECTS[categoryKey] || MOCK_PROSPECTS.residential
    prospects.forEach(prospect => {
      availableCombinations.push({
        categoryId: category.id,
        categoryName: category.name,
        prospect
      })
    })
  })
  
  // Shuffle the available combinations
  for (let i = availableCombinations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[availableCombinations[i], availableCombinations[j]] = [availableCombinations[j], availableCombinations[i]]
  }
  
  // Generate 5 unique prospects
  for (let i = 0; i < Math.min(5, availableCombinations.length); i++) {
    const combination = availableCombinations[i]
    const titles = propertyTypes[combination.categoryName] || propertyTypes["Residential"]
    const randomTitle = titles[Math.floor(Math.random() * titles.length)]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]
    const basePrice = Math.floor(Math.random() * 50000000) + 10000000 // 10M to 60M Naira
    const yearBuilt = Math.floor(Math.random() * 20) + 2005 // 2005-2024
    
    const purchaseCost = basePrice * combination.prospect.purchaseCostFactor
    const developmentCost = basePrice * combination.prospect.developmentCostFactor
    const estimatedCost = Math.round(purchaseCost + developmentCost)
    const totalCost = Math.round(basePrice + estimatedCost)
    
    allProspects.push({
      id: i + 1,
      categoryId: combination.categoryId,
      categoryName: combination.categoryName,
      propertyTitle: randomTitle,
      location: randomLocation,
      estimatedWorth: basePrice,
      yearBuilt: Math.random() > 0.3 ? yearBuilt : undefined,
      prospect: {
        title: combination.prospect.title,
        description: combination.prospect.description,
        estimatedCost,
        totalCost,
        imageUrl: combination.prospect.imageUrl, // Include the image URL from aiProspects
      }
    })
  }
  
  return allProspects
}

export default function AICaptureImagePage() {
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
      onImageCaptured={handleImageCaptured}
      fromLogin={fromLogin}
    />
  )
}

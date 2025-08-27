"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ImageCaptureModal } from "../camera/image-capture-modal"
import { api, type Category } from "@/lib/api"
import { toast } from "sonner"

interface SmartProspectFeatureProps {
  isOpen: boolean
  onClose: () => void
  triggerOnLogin?: boolean
}

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

  const propertyTypes = {
    1: ["Modern Apartment Complex", "Luxury Residential Building", "Executive Flat"],
    2: ["Commercial Plaza", "Office Complex", "Shopping Mall"],
    3: ["Undeveloped Land Plot", "Prime Development Site", "Investment Land"],
    4: ["Warehouse Facility", "Industrial Complex", "Manufacturing Plant"],
  }

  // Map category IDs to prospect categories in the aiProspects library
  const categoryMap: { [key: number]: keyof typeof MOCK_PROSPECTS } = {
    1: "residential",
    2: "commercial",
    3: "agricultural", // Land category maps to agricultural
    4: "industrial",
  }

  // Generate 5 different prospects from different categories using the aiProspects library
  const allProspects: any[] = []
  
  // Create a pool of all possible category-prospect combinations from the aiProspects library
  const availableCombinations: Array<{ categoryId: number, categoryName: string, prospect: PropertyProspect }> = []
  
  categories.forEach(category => {
    const categoryKey = categoryMap[category.id] || "residential"
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
    const titles = propertyTypes[combination.categoryId as keyof typeof propertyTypes] || propertyTypes[1]
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

export function SmartProspectFeature({ isOpen, onClose, triggerOnLogin = false }: SmartProspectFeatureProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast.error("Failed to load categories")
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
      
      // Close the modal and navigate to preview page
      onClose()
      
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
    onClose()
  }

  return (
    <ImageCaptureModal
      isOpen={isOpen}
      onClose={handleClose}
      onImageCaptured={handleImageCaptured}
      fromLogin={triggerOnLogin}
    />
  )
}

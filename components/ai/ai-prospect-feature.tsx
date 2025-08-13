"use client"

import { useState, useEffect } from "react"
import { ImageCaptureModal } from "../camera/image-capture-modal"
import { ProspectAnalysisModal } from "./prospect-analysis-modal"
import { AddProspectModal } from "../prospect/add-prospect-modal"
import { api, type Category } from "@/lib/api"
import { toast } from "sonner"

interface AIProspectFeatureProps {
  isOpen: boolean
  onClose: () => void
  triggerOnLogin?: boolean
}

// Mock AI analysis generator
const generateRandomAnalysis = (category: Category) => {
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

  const insights = [
    "High demand area with growing population",
    "Excellent transportation links and infrastructure",
    "Strong rental yield potential in this location",
    "Property values have appreciated 15% in the last year",
    "Close proximity to business districts and amenities",
    "Government development projects planned nearby",
    "Low crime rate and family-friendly neighborhood",
    "Good schools and healthcare facilities in the area",
  ]

  const recommendations = [
    "Consider immediate acquisition due to market trends",
    "Negotiate price based on current market conditions",
    "Explore financing options for maximum leverage",
    "Plan for property improvements to increase value",
    "Consider rental income potential for ROI calculation",
    "Verify all legal documentation before purchase",
    "Conduct thorough property inspection",
    "Research local zoning laws and regulations",
  ]

  const risks = [
    "Market volatility may affect property values",
    "Infrastructure development delays possible",
    "Regulatory changes may impact investment returns",
    "Competition from new developments in the area",
    "Economic factors may influence demand",
    "Maintenance costs may be higher than expected",
  ]

  const titles = propertyTypes[category.id as keyof typeof propertyTypes] || propertyTypes[1]
  const randomTitle = titles[Math.floor(Math.random() * titles.length)]
  const randomLocation = locations[Math.floor(Math.random() * locations.length)]
  const basePrice = Math.floor(Math.random() * 50000000) + 10000000 // 10M to 60M Naira
  const confidence = Math.floor(Math.random() * 30) + 70 // 70-100%
  const sentiment = ["Positive", "Neutral", "Negative"][Math.floor(Math.random() * 3)] as
    | "Positive"
    | "Neutral"
    | "Negative"
  const yearBuilt = Math.floor(Math.random() * 20) + 2005 // 2005-2024
  const roiPercentage = Math.floor(Math.random() * 15) + 8 // 8-22%

  return {
    title: randomTitle,
    location: randomLocation,
    estimatedWorth: basePrice,
    yearBuilt: Math.random() > 0.3 ? yearBuilt : undefined,
    confidence,
    sentiment,
    insights: insights.sort(() => 0.5 - Math.random()).slice(0, 4),
    recommendations: recommendations.sort(() => 0.5 - Math.random()).slice(0, 3),
    riskFactors: risks.sort(() => 0.5 - Math.random()).slice(0, 3),
    estimatedROI: `${roiPercentage}% annually`,
  }
}

export function AIProspectFeature({ isOpen, onClose, triggerOnLogin = false }: AIProspectFeatureProps) {
  const [currentStep, setCurrentStep] = useState<"capture" | "analysis" | "form">("capture")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)

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

  const handleImageCaptured = async (file: File, categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file)

    setImageFile(file)
    setCapturedImage(imageUrl)
    setSelectedCategory(category)

    // Generate AI analysis
    const generatedAnalysis = generateRandomAnalysis(category)
    setAnalysis(generatedAnalysis)

    setCurrentStep("analysis")
  }

  const handleAddProperty = () => {
    setCurrentStep("form")
  }

  const handleFormSubmit = async (formData: any) => {
    if (!selectedCategory || !imageFile) return

    try {
      // Upload image first (in a real app, you'd upload to a cloud service)
      // For now, we'll use a placeholder URL
      const imageUrl = `https://picsum.photos/800/600?random=${Date.now()}`

      const prospectData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category_id: selectedCategory.id,
        estimated_worth: formData.estimatedWorth ? Number.parseFloat(formData.estimatedWorth) : undefined,
        year_of_construction: formData.yearOfConstruction ? Number.parseInt(formData.yearOfConstruction) : undefined,
        image_url: imageUrl,
      }

      const response = await api.createProspectProperty(prospectData)

      if (response.success) {
        toast.success("Prospect property added successfully!")
        handleClose()
      }
    } catch (error: any) {
      throw error
    }
  }

  const handleClose = () => {
    setCurrentStep("capture")
    setSelectedCategory(null)
    setCapturedImage(null)
    setImageFile(null)
    setAnalysis(null)
    onClose()
  }

  return (
    <>
      <ImageCaptureModal
        isOpen={isOpen && currentStep === "capture"}
        onClose={handleClose}
        categories={categories}
        onImageCaptured={handleImageCaptured}
        fromLogin={triggerOnLogin}
      />

      {selectedCategory && analysis && capturedImage && (
        <ProspectAnalysisModal
          isOpen={currentStep === "analysis"}
          onClose={handleClose}
          onAddProperty={handleAddProperty}
          imageUrl={capturedImage}
          category={selectedCategory}
          analysis={analysis}
        />
      )}

      {selectedCategory && analysis && (
        <AddProspectModal
          isOpen={currentStep === "form"}
          onClose={handleClose}
          onSubmit={handleFormSubmit}
          category={selectedCategory}
          initialData={{
            title: analysis.title,
            location: analysis.location,
            estimatedWorth: analysis.estimatedWorth,
            yearBuilt: analysis.yearBuilt,
          }}
        />
      )}
    </>
  )
}

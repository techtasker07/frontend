"use client"

import { useState, useEffect } from "react"
import { ImageCaptureModal } from "../camera/image-capture-modal"
import { ProspectPreviewModal } from "./prospect-preview-modal"
import { AddProspectModal } from "../prospect/add-prospect-modal"
import { api, type Category } from "@/lib/api"
import { toast } from "sonner"

interface AIProspectFeatureProps {
  isOpen: boolean
  onClose: () => void
  triggerOnLogin?: boolean
}

// Generate random prospect for category
const generateRandomProspect = (category: Category) => {
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

  // Prospect data similar to the existing prospect system
  const categoryProspects: { [key: number]: Array<{ title: string; description: string; costFactor: number }> } = {
    1: [
      // Residential
      {
        title: "Short Let Plan",
        description: "Convert your residential property into a short-term rental for tourists, expatriates, or corporate guests. Works best in high-traffic cities like Lagos, Abuja, and Port Harcourt.",
        costFactor: 0.15,
      },
      {
        title: "Student Housing Investment",
        description: "Repurpose your residential building into a hostel or shared apartments targeting university students in areas like Ibadan, Nsukka, or Benin City.",
        costFactor: 0.25,
      },
      {
        title: "Co-living Space Development",
        description: "Transform property into modern co-living spaces with shared amenities, targeting young professionals and digital nomads.",
        costFactor: 0.2,
      },
      {
        title: "Senior Living Community",
        description: "Develop assisted living or retirement community facilities with healthcare support and recreational amenities.",
        costFactor: 0.35,
      },
    ],
    2: [
      // Commercial
      {
        title: "Tech Hub & Co-working Space",
        description: "Transform your commercial property into a modern co-working space targeting startups, freelancers, and remote workers.",
        costFactor: 0.25,
      },
      {
        title: "Retail Shopping Complex",
        description: "Develop a multi-tenant retail space with diverse shops, restaurants, and service providers in high-traffic areas.",
        costFactor: 0.3,
      },
      {
        title: "Medical Center Complex",
        description: "Convert property into a medical facility housing multiple healthcare providers, clinics, and diagnostic centers.",
        costFactor: 0.4,
      },
      {
        title: "Event & Conference Center",
        description: "Develop a versatile event space for weddings, corporate events, conferences, and social gatherings.",
        costFactor: 0.35,
      },
    ],
    3: [
      // Land/Agricultural
      {
        title: "Residential Estate Development",
        description: "Develop the land into a modern residential estate with multiple housing units, infrastructure, and amenities.",
        costFactor: 0.6,
      },
      {
        title: "Commercial Plaza Development",
        description: "Transform the land into a commercial plaza with shops, offices, and service centers.",
        costFactor: 0.7,
      },
      {
        title: "Smart Greenhouse Complex",
        description: "Develop climate-controlled greenhouse facilities for year-round production of high-value crops and vegetables.",
        costFactor: 0.4,
      },
      {
        title: "Mixed-Use Development",
        description: "Create a mixed-use development combining residential, commercial, and recreational spaces.",
        costFactor: 0.8,
      },
    ],
    4: [
      // Industrial/Material
      {
        title: "Logistics & Warehousing Hub",
        description: "Convert into a modern logistics center with automated storage and distribution capabilities.",
        costFactor: 0.3,
      },
      {
        title: "Manufacturing Facility",
        description: "Develop specialized manufacturing plant for local production and export opportunities.",
        costFactor: 0.5,
      },
      {
        title: "Data Center Complex",
        description: "Transform into a secure data center facility serving cloud computing and digital infrastructure needs.",
        costFactor: 0.6,
      },
      {
        title: "Industrial Park Development",
        description: "Create a multi-tenant industrial park with shared utilities and services for various businesses.",
        costFactor: 0.4,
      },
    ],
  }

  const prospects = categoryProspects[category.id] || categoryProspects[1]
  const randomProspect = prospects[Math.floor(Math.random() * prospects.length)]
  const titles = propertyTypes[category.id as keyof typeof propertyTypes] || propertyTypes[1]
  const randomTitle = titles[Math.floor(Math.random() * titles.length)]
  const randomLocation = locations[Math.floor(Math.random() * locations.length)]
  const basePrice = Math.floor(Math.random() * 50000000) + 10000000 // 10M to 60M Naira
  const yearBuilt = Math.floor(Math.random() * 20) + 2005 // 2005-2024

  const estimatedCost = Math.round(basePrice * randomProspect.costFactor)
  const totalCost = Math.round(basePrice + estimatedCost)

  return {
    propertyTitle: randomTitle,
    location: randomLocation,
    estimatedWorth: basePrice,
    yearBuilt: Math.random() > 0.3 ? yearBuilt : undefined,
    prospect: {
      title: randomProspect.title,
      description: randomProspect.description,
      estimatedCost,
      totalCost,
    }
  }
}

export function AIProspectFeature({ isOpen, onClose, triggerOnLogin = false }: AIProspectFeatureProps) {
  const [currentStep, setCurrentStep] = useState<"capture" | "preview" | "form">("capture")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [prospectData, setProspectData] = useState<any>(null)

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

    // Generate random prospect
    const generatedData = generateRandomProspect(category)
    setProspectData(generatedData)

    setCurrentStep("preview")
  }

  const handleAddProperty = () => {
    setCurrentStep("form")
  }

  const handleFormSubmit = async (formData: any) => {
    if (!selectedCategory || !imageFile || !prospectData) return

    try {
      // Upload image first (in a real app, you'd upload to a cloud service)
      // For now, we'll use a placeholder URL
      const imageUrl = `https://picsum.photos/800/600?random=${Date.now()}`

      const propertyData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category_id: selectedCategory.id,
        estimated_worth: formData.estimatedWorth ? Number.parseFloat(formData.estimatedWorth) : undefined,
        year_of_construction: formData.yearOfConstruction ? Number.parseInt(formData.yearOfConstruction) : undefined,
        image_url: imageUrl,
      }

      const response = await api.createProspectProperty(propertyData)

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
    setProspectData(null)
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

      {selectedCategory && prospectData && capturedImage && (
        <ProspectPreviewModal
          isOpen={currentStep === "preview"}
          onClose={handleClose}
          onAddProperty={handleAddProperty}
          imageUrl={capturedImage}
          category={selectedCategory}
          prospect={prospectData.prospect}
        />
      )}

      {selectedCategory && prospectData && (
        <AddProspectModal
          isOpen={currentStep === "form"}
          onClose={handleClose}
          onSubmit={handleFormSubmit}
          category={selectedCategory}
          initialData={{
            title: prospectData.propertyTitle,
            location: prospectData.location,
            estimatedWorth: prospectData.estimatedWorth,
            yearBuilt: prospectData.yearBuilt,
          }}
        />
      )}
    </>
  )
}

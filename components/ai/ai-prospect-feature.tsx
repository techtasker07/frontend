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

import { performSmartAnalysis, generatePropertyDetails, generateSmartProspects, type IdentifiedCategory } from "@/lib/smartProspectGenerator"

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

  const handleImageCaptured = async (file: File, identifiedCategory?: IdentifiedCategory) => {
    try {
      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file)
      
      // Use identified category or fallback to 'building'
      const category = identifiedCategory || { name: 'building', confidence: 0.75 }
      
      // Generate property details and smart prospects
      const propertyDetails = generatePropertyDetails(category.name)
      const smartProspects = generateSmartProspects(category, propertyDetails)
      
      // Store data in sessionStorage for navigation
      sessionStorage.setItem("ai-prospects", JSON.stringify(smartProspects))
      sessionStorage.setItem("ai-prospect-image", imageUrl)
      sessionStorage.setItem("property-details", JSON.stringify(propertyDetails))
      sessionStorage.setItem("identified-category", JSON.stringify(category))
      
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

  // If triggered, directly navigate to the page instead of showing modal
  useEffect(() => {
    if (isOpen && triggerOnLogin) {
      onClose()
      router.push("/ai/capture-image?fromLogin=true")
    }
  }, [isOpen, triggerOnLogin, router, onClose])

  return (
    <ImageCaptureModal
      isOpen={isOpen && !triggerOnLogin}
      onClose={handleClose}
      onImageCaptured={handleImageCaptured}
      fromLogin={triggerOnLogin}
    />
  )
}

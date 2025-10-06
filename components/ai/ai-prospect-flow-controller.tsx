"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SmartCamerCapture } from "./smart-camera-capture"
import { PropertyDetailsForm } from "./property-details-form"
import { PropertyProspectsResults } from "./property-prospects-results"
import { toast } from "sonner"
import { supabaseApi } from "@/lib/supabase-api"
import type { PropertyAnalysis } from "@/lib/google-vision-service"
import type { ProspectGenerationResult, PropertyFormData } from "@/lib/vertex-ai-service"

type FlowStep = 'camera' | 'form' | 'results'

interface AIProspectFlowControllerProps {
  initialStep?: FlowStep
  onComplete?: (results: ProspectGenerationResult) => void
  onCancel?: () => void
}

export function AIProspectFlowController({
  initialStep = 'camera',
  onComplete,
  onCancel
}: AIProspectFlowControllerProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FlowStep>(initialStep)
  const [imageData, setImageData] = useState<string | null>(null)
  const [visionAnalysis, setVisionAnalysis] = useState<PropertyAnalysis | null>(null)
  const [prospectResults, setProspectResults] = useState<ProspectGenerationResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingProspects, setIsGeneratingProspects] = useState(false)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  const handleImageCapture = useCallback(async (capturedImageData: string) => {
    setImageData(capturedImageData)
    setIsAnalyzing(true)

    try {
      // Analyze image with Google Vision API
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: capturedImageData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const { analysis } = await response.json()
      setVisionAnalysis(analysis)
      
      toast.success("Image analyzed successfully!")
      
      // Move to form step
      setCurrentStep('form')

    } catch (error) {
      console.error('Error analyzing image:', error)
      toast.error("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleFormSubmit = useCallback(async (formData: PropertyFormData) => {
    if (!visionAnalysis) {
      toast.error("No vision analysis available")
      return
    }

    setIsGeneratingProspects(true)

    try {
      // Generate prospects using Vertex AI
      const response = await fetch('/api/ai/generate-prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visionAnalysis,
          formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate prospects')
      }

      const { prospects } = await response.json()
      
      // Save to Supabase
      const saveResult = await supabaseApi.savePropertyAnalysis({
        property_address: formData.address,
        property_type: formData.propertyType,
        square_meters: formData.squareMeters ? parseFloat(formData.squareMeters) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
        current_use: formData.currentUse,
        budget_range: formData.budget,
        timeline: formData.timeline,
        ownership_status: formData.ownershipStatus,
        additional_info: formData.additionalInfo,
        property_image_url: imageData,
        vision_analysis: visionAnalysis,
        prospects: prospects.prospects,
        insights: prospects.analysisInsights
      })

      if (saveResult.success) {
        setAnalysisId(saveResult.data.analysisId)
        toast.success("Prospects generated and saved successfully!")
      } else {
        console.warn('Failed to save to database:', saveResult.error)
        toast.success("Prospects generated successfully!")
      }
      
      setProspectResults(prospects)
      
      // Move to results step
      setCurrentStep('results')

      if (onComplete) {
        onComplete(prospects)
      }

    } catch (error) {
      console.error('Error generating prospects:', error)
      toast.error("Failed to generate prospects. Please try again.")
    } finally {
      setIsGeneratingProspects(false)
    }
  }, [visionAnalysis, onComplete, imageData])

  const handleClose = useCallback(() => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/dashboard')
    }
  }, [onCancel, router])

  const handleSaveProspects = useCallback(async (prospects: any[]) => {
    try {
      // Prospects are already saved to Supabase during generation
      if (analysisId) {
        toast.success("Prospects are already saved to your dashboard!")
      } else {
        toast.info("Prospects will be saved after generation")
      }
    } catch (error) {
      console.error('Error with prospects save:', error)
      toast.error("Failed to access saved prospects")
    }
  }, [analysisId])

  // Render appropriate step
  switch (currentStep) {
    case 'camera':
      return (
        <SmartCamerCapture
          onImageCapture={handleImageCapture}
          onClose={handleClose}
        />
      )

    case 'form':
      return (
        <PropertyDetailsForm
          isOpen={true}
          onClose={handleClose}
          imageData={imageData || ''}
          visionAnalysis={visionAnalysis}
          onSubmit={handleFormSubmit}
        />
      )

    case 'results':
      return prospectResults ? (
        <PropertyProspectsResults
          results={prospectResults}
          imageData={imageData || undefined}
          onClose={handleClose}
          onSaveProspects={handleSaveProspects}
        />
      ) : null

    default:
      return null
  }
}

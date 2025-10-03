"use client"

import type React from "react"

import { AdvancedImageCapture } from "@/components/camera/advanced-image-capture"
import { type IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface ImageCapturePageProps {
  onClose: () => void
  onBack?: () => void
  onImageCaptured: (imageFile: File, identifiedCategory?: IdentifiedCategory) => void
  fromLogin?: boolean
  autoStartCamera?: boolean
}

export function ImageCapturePage({ onClose, onBack, onImageCaptured, fromLogin = false, autoStartCamera = false }: ImageCapturePageProps) {
  return (
    <AdvancedImageCapture
      onClose={onClose}
      onBack={onBack}
      onImageCaptured={onImageCaptured}
      fromLogin={fromLogin}
      autoStartCamera={autoStartCamera}
    />
  )
}

"use client"

import React from 'react'
import { AdvancedImageCapture } from './advanced-image-capture'
import { type IdentifiedCategory } from '@/lib/smartProspectGenerator'

interface ImageCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onImageCaptured: (imageFile: File, identifiedCategory?: IdentifiedCategory) => void
  fromLogin?: boolean
}

export function ImageCaptureModal({ 
  isOpen, 
  onClose, 
  onImageCaptured, 
  fromLogin = false 
}: ImageCaptureModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <AdvancedImageCapture
        onClose={onClose}
        onImageCaptured={onImageCaptured}
        fromLogin={fromLogin}
        autoStartCamera={false}
      />
    </div>
  )
}

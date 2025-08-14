"use client"

import { useState } from "react"
import { AIProspectFeature } from "./ai-prospect-feature"

interface AIProspectWrapperProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AIProspectWrapper({ isOpen = false, onClose }: AIProspectWrapperProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalOpen(false)
    }
  }

  const isFeatureOpen = isOpen || internalOpen

  return <AIProspectFeature isOpen={isFeatureOpen} onClose={handleClose} />
}
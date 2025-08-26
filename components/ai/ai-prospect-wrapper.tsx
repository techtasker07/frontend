"use client"

import { useState } from "react"
import { SmartProspectFeature } from "./ai-prospect-feature"

interface SmartProspectWrapperProps {
  isOpen?: boolean
  onClose?: () => void
}

export function SmartProspectWrapper({ isOpen = false, onClose }: SmartProspectWrapperProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalOpen(false)
    }
  }

  const isFeatureOpen = isOpen || internalOpen

  return <SmartProspectFeature isOpen={isFeatureOpen} onClose={handleClose} />
}

"use client"

import { useAuth } from "@/lib/auth"
import { AIProspectFeature } from "./ai-prospect-feature"

export function AIProspectWrapper() {
  const { showAIProspectFeature, setShowAIProspectFeature } = useAuth()

  return <AIProspectFeature isOpen={showAIProspectFeature} onClose={() => setShowAIProspectFeature(false)} />
}

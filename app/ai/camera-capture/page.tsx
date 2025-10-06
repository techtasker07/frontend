"use client"

import { AIProspectFlowController } from "@/components/ai/ai-prospect-flow-controller"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AICameraCaptursPage() {
  return (
    <ProtectedRoute>
      <AIProspectFlowController initialStep="camera" />
    </ProtectedRoute>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { vertexAIService } from '@/lib/vertex-ai-service'
import type { PropertyAnalysis } from '@/lib/google-vision-service'
import type { PropertyFormData } from '@/lib/vertex-ai-service'

export async function POST(request: NextRequest) {
  try {
    const { visionAnalysis, formData } = await request.json()

    if (!visionAnalysis || !formData) {
      return NextResponse.json(
        { error: 'Vision analysis and form data are required' },
        { status: 400 }
      )
    }

    // Generate property prospects using Vertex AI
    const prospects = await vertexAIService.generatePropertyProspects(
      visionAnalysis as PropertyAnalysis,
      formData as PropertyFormData
    )

    return NextResponse.json({ prospects })

  } catch (error) {
    console.error('Prospect generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate prospects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

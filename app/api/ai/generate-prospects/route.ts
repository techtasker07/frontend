import { NextRequest, NextResponse } from 'next/server'
import { vertexAIService } from '@/lib/vertex-ai-service'
import type { PropertyAnalysis } from '@/lib/google-vision-service'
import type { PropertyFormData } from '@/lib/vertex-ai-service'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('[PROSPECTS API] Starting prospect generation request')

  try {
    const { visionAnalysis, formData } = await request.json()
    console.log('[PROSPECTS API] Received request with visionAnalysis and formData:', {
      hasVisionAnalysis: !!visionAnalysis,
      hasFormData: !!formData,
      formDataKeys: formData ? Object.keys(formData) : []
    })

    if (!visionAnalysis || !formData) {
      console.error('[PROSPECTS API] Missing required data:', { visionAnalysis: !!visionAnalysis, formData: !!formData })
      return NextResponse.json(
        { error: 'Vision analysis and form data are required' },
        { status: 400 }
      )
    }

    console.log('[PROSPECTS API] Authenticating user')
    // Get user from session
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[PROSPECTS API] Authentication failed:', { authError, hasUser: !!user })
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('[PROSPECTS API] User authenticated, calling vertexAIService.generatePropertyProspects for user:', user.id)
    // Generate property prospects using Vertex AI
    const prospects = await vertexAIService.generatePropertyProspects(
      visionAnalysis as PropertyAnalysis,
      formData as PropertyFormData,
      user.id
    )

    console.log('[PROSPECTS API] Prospects generated successfully:', {
      totalProspects: prospects.prospects?.length || 0,
      generatedAt: prospects.generatedAt
    })

    return NextResponse.json({ prospects })

  } catch (error) {
    console.error('[PROSPECTS API] Prospect generation failed:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate prospects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

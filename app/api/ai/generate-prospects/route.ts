import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prospectEngineService } from '@/lib/prospect-engine-service'
import type { PropertyAnalysis } from '@/lib/google-vision-service'
import type { PropertyFormData } from '@/lib/prospect-engine-service'
import { createServerClient } from '@supabase/ssr'

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

    console.log('[PROSPECTS API] Generating prospects without authentication (in-app engine)')
    // Generate property prospects using in-app engine (no auth required)
    const prospects = await prospectEngineService.generatePropertyProspects(
      visionAnalysis as PropertyAnalysis,
      formData as PropertyFormData
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

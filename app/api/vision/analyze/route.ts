import { NextRequest, NextResponse } from 'next/server'
import { googleVisionService } from '@/lib/google-vision-service'

export async function POST(request: NextRequest) {
  console.log('[VISION API] Starting image analysis request')

  try {
    const { imageData } = await request.json()
    console.log('[VISION API] Received request with imageData length:', imageData?.length || 'undefined')

    if (!imageData) {
      console.error('[VISION API] No image data provided')
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    console.log('[VISION API] Calling googleVisionService.analyzePropertyImage')
    // Analyze the image using Google Vision
    const analysis = await googleVisionService.analyzePropertyImage(imageData)
    console.log('[VISION API] Analysis completed successfully:', {
      propertyType: analysis.propertyType,
      confidence: analysis.confidence,
      featuresCount: analysis.features.length
    })

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('[VISION API] Analysis failed:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

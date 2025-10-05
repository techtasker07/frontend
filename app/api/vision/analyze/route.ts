import { NextRequest, NextResponse } from 'next/server'
import { googleVisionService } from '@/lib/google-vision-service'

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Analyze the image using Google Vision
    const analysis = await googleVisionService.analyzePropertyImage(imageData)

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('Vision API analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

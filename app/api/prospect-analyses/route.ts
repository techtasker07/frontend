import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      propertyImageUrl,
      propertyData,
      valuation,
      prospects,
      identifiedCategory
    } = body

    // Validate required fields
    if (!propertyData || !prospects || !identifiedCategory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Insert the prospect analysis
    const { data, error } = await supabase
      .from('prospect_analyses')
      .insert({
        user_id: user.id,
        property_image_url: propertyImageUrl,
        property_data: propertyData,
        valuation: valuation || {},
        prospects: prospects,
        identified_category: identifiedCategory,
        status: 'completed'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving prospect analysis:', error)
      return NextResponse.json(
        { error: 'Failed to save prospect analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Get user's prospect analyses
    const { data, error } = await supabase
      .from('prospect_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching prospect analyses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch prospect analyses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
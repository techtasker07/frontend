import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      propertyImageUrl,
      propertyData,
      valuation,
      prospects,
      identifiedCategory
    } = body

    // Validate required fields
    if (!userId || !propertyData || !prospects || !identifiedCategory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Insert the prospect analysis
    const { data, error } = await supabase
      .from('prospect_analyses')
      .insert({
        user_id: userId,
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
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get user's prospect analyses
    const { data, error } = await supabase
      .from('prospect_analyses')
      .select('*')
      .eq('user_id', userId)
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
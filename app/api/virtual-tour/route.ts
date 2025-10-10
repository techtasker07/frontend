import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { VirtualTourData, VirtualTourScene, VirtualTourHotspot } from '@/lib/virtual-tour'

// GET /api/virtual-tour?marketplaceListingId=<id> - Get virtual tour for a marketplace listing
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.error('Virtual Tour API: NEXT_PUBLIC_SUPABASE_URL not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let supabaseClient
    if (supabaseServiceKey) {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      console.warn('Virtual Tour API: SUPABASE_SERVICE_ROLE_KEY not configured, using anon key')
      supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const marketplaceListingId = searchParams.get('marketplaceListingId')

    if (!marketplaceListingId) {
      return NextResponse.json(
        { success: false, error: 'Marketplace listing ID is required' },
        { status: 400 }
      )
    }

    // Get the virtual tour
    const { data: tour, error: tourError } = await supabaseClient
      .from('virtual_tours')
      .select('*')
      .eq('marketplace_listing_id', marketplaceListingId)
      .eq('is_active', true)
      .single()

    if (tourError && tourError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching virtual tour:', tourError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch virtual tour' },
        { status: 500 }
      )
    }

    if (!tour) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }

    // Get scenes for this tour
    const { data: scenes, error: scenesError } = await supabaseClient
      .from('virtual_tour_scenes')
      .select('*')
      .eq('virtual_tour_id', tour.id)
      .order('scene_order', { ascending: true })

    if (scenesError) {
      console.error('Error fetching tour scenes:', scenesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tour scenes' },
        { status: 500 }
      )
    }

    // Get navigation connections for all scenes
    const sceneIds = scenes.map((s: any) => s.id)
    const { data: navigation, error: navigationError } = await supabaseClient
      .from('virtual_tour_navigation')
      .select('*')
      .in('from_scene_id', sceneIds)

    if (navigationError) {
      console.error('Error fetching navigation:', navigationError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch navigation' },
        { status: 500 }
      )
    }

    // Convert navigation to hotspots format for compatibility
    const hotspots: VirtualTourHotspot[] = navigation.map(nav => ({
      id: nav.id,
      target_scene_id: scenes.find(s => s.id === nav.to_scene_id)?.scene_order.toString() || nav.to_scene_id,
      position: nav.hotspot_position,
      title: nav.hotspot_title,
      description: nav.hotspot_description,
      type: 'navigation' as const
    }))

    // Group hotspots by scene
    const scenesWithHotspots = scenes.map(scene => ({
      id: scene.id,
      scene_id: scene.scene_order.toString(),
      name: scene.name,
      image_url: scene.image_url,
      description: scene.description,
      position: scene.position,
      hotspots: hotspots.filter(h => {
        const fromScene = scenes.find(s => s.id === navigation.find(n => n.id === h.id)?.from_scene_id)
        return fromScene?.id === scene.id
      })
    }))

    const virtualTourData: VirtualTourData = {
      id: tour.id,
      property_id: tour.marketplace_listing_id, // Keep for compatibility
      title: tour.title,
      description: tour.description,
      scenes: scenesWithHotspots,
      default_scene_id: scenesWithHotspots[0]?.scene_id || '0',
      settings: tour.settings,
      created_at: tour.created_at,
      updated_at: tour.updated_at
    }

    return NextResponse.json({
      success: true,
      data: virtualTourData
    })

  } catch (error) {
    console.error('Error in GET /api/virtual-tour:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/virtual-tour - Create a new virtual tour
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.error('Virtual Tour API: NEXT_PUBLIC_SUPABASE_URL not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let supabaseClient
    if (supabaseServiceKey) {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      console.warn('Virtual Tour API: SUPABASE_SERVICE_ROLE_KEY not configured, using anon key')
      supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }

    const body = await request.json()
    const {
      property_id, // Keep for backward compatibility, but use marketplace_listing_id
      marketplace_listing_id,
      title,
      description,
      scenes,
      default_scene_id,
      settings
    } = body

    const listingId = marketplace_listing_id || property_id

    if (!listingId || !title || !scenes || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: marketplace_listing_id, title, scenes' },
        { status: 400 }
      )
    }

    // Check if a virtual tour already exists for this listing
    const { data: existingTour } = await supabaseClient
      .from('virtual_tours')
      .select('id')
      .eq('marketplace_listing_id', listingId)
      .single()

    if (existingTour) {
      return NextResponse.json(
        { success: false, error: 'A virtual tour already exists for this listing' },
        { status: 400 }
      )
    }

    // Start a transaction-like operation
    // First, create the virtual tour
    const { data: tour, error: tourError } = await supabaseClient
      .from('virtual_tours')
      .insert({
        marketplace_listing_id: listingId,
        title,
        description,
        settings: settings || {},
        is_active: true
      })
      .select()
      .single()

    if (tourError) {
      console.error('Error creating virtual tour:', tourError)
      return NextResponse.json(
        { success: false, error: 'Failed to create virtual tour' },
        { status: 500 }
      )
    }

    // Create scenes
    const scenesToInsert = scenes.map((scene: any, index: number) => ({
      virtual_tour_id: tour.id,
      scene_order: index,
      name: scene.name,
      image_url: scene.image_url,
      description: scene.description,
      position: scene.position
    }))

    const { data: createdScenes, error: scenesError } = await supabaseClient
      .from('virtual_tour_scenes')
      .insert(scenesToInsert)
      .select()

    if (scenesError) {
      console.error('Error creating scenes:', scenesError)
      // Clean up the tour if scenes creation failed
      await supabaseClient.from('virtual_tours').delete().eq('id', tour.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create tour scenes' },
        { status: 500 }
      )
    }

    // Create navigation connections if hotspots are provided
    const navigationToInsert: any[] = []
    scenes.forEach((scene: any, sceneIndex: number) => {
      if (scene.hotspots && scene.hotspots.length > 0) {
        const fromScene = createdScenes[sceneIndex]
        scene.hotspots.forEach((hotspot: any) => {
          // Find the target scene by scene_id (which should be the scene_order as string)
          const targetSceneIndex = parseInt(hotspot.target_scene_id) || 0
          const toScene = createdScenes[targetSceneIndex]

          if (toScene && fromScene.id !== toScene.id) {
            navigationToInsert.push({
              from_scene_id: fromScene.id,
              to_scene_id: toScene.id,
              hotspot_position: hotspot.position,
              hotspot_title: hotspot.title,
              hotspot_description: hotspot.description
            })
          }
        })
      }
    })

    if (navigationToInsert.length > 0) {
      const { error: navigationError } = await supabaseClient
        .from('virtual_tour_navigation')
        .insert(navigationToInsert)

      if (navigationError) {
        console.error('Error creating navigation:', navigationError)
        // Don't fail the whole operation for navigation, just log the error
      }
    }

    // Fetch the complete tour data
    const { data: completeTour, error: fetchError } = await supabaseClient
      .from('virtual_tours')
      .select('*')
      .eq('id', tour.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete tour:', fetchError)
    }

    return NextResponse.json({
      success: true,
      data: completeTour,
      message: 'Virtual tour created successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/virtual-tour:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/virtual-tour?id=<id> - Update a virtual tour
export async function PUT(request: NextRequest) {
  try {
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.error('Virtual Tour API: NEXT_PUBLIC_SUPABASE_URL not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let supabaseClient
    if (supabaseServiceKey) {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      console.warn('Virtual Tour API: SUPABASE_SERVICE_ROLE_KEY not configured, using anon key')
      supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('id')

    if (!tourId) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, description, default_scene_id, settings, property_id } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Only allow updating certain fields
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (default_scene_id !== undefined) updateData.default_scene_id = default_scene_id
    if (settings !== undefined) updateData.settings = settings
    if (property_id !== undefined) updateData.property_id = property_id

    const { data: tour, error: tourError } = await supabaseClient
      .from('virtual_tours')
      .update(updateData)
      .eq('id', tourId)
      .select()
      .single()

    if (tourError) {
      console.error('Error updating virtual tour:', tourError)
      return NextResponse.json(
        { success: false, error: 'Failed to update virtual tour' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tour,
      message: 'Virtual tour updated successfully'
    })

  } catch (error) {
    console.error('Error in PUT /api/virtual-tour:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/virtual-tour/[id] - Delete a virtual tour
export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.error('Virtual Tour API: NEXT_PUBLIC_SUPABASE_URL not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let supabaseClient
    if (supabaseServiceKey) {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      console.warn('Virtual Tour API: SUPABASE_SERVICE_ROLE_KEY not configured, using anon key')
      supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('id')

    if (!tourId) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      )
    }

    // Delete the tour (cascading will handle scenes and hotspots)
    const { error: deleteError } = await supabaseClient
      .from('virtual_tours')
      .delete()
      .eq('id', tourId)

    if (deleteError) {
      console.error('Error deleting virtual tour:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete virtual tour' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Virtual tour deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/virtual-tour:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
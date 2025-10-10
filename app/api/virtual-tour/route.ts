import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { VirtualTourData, VirtualTourScene, VirtualTourHotspot } from '@/lib/virtual-tour'

// GET /api/virtual-tour?propertyId=<id> - Get virtual tour for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Get the virtual tour
    const { data: tour, error: tourError } = await supabase
      .from('virtual_tours')
      .select('*')
      .eq('property_id', propertyId)
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
    const { data: scenes, error: scenesError } = await supabase
      .from('virtual_tour_scenes')
      .select('*')
      .eq('tour_id', tour.id)
      .order('created_at', { ascending: true })

    if (scenesError) {
      console.error('Error fetching tour scenes:', scenesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tour scenes' },
        { status: 500 }
      )
    }

    // Get hotspots for all scenes
    const sceneIds = scenes.map(s => s.id)
    const { data: hotspots, error: hotspotsError } = await supabase
      .from('virtual_tour_hotspots')
      .select('*')
      .in('scene_id', sceneIds)

    if (hotspotsError) {
      console.error('Error fetching hotspots:', hotspotsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch hotspots' },
        { status: 500 }
      )
    }

    // Group hotspots by scene
    const scenesWithHotspots = scenes.map(scene => ({
      ...scene,
      hotspots: hotspots.filter(h => h.scene_id === scene.id)
    }))

    const virtualTourData: VirtualTourData = {
      id: tour.id,
      property_id: tour.property_id,
      title: tour.title,
      description: tour.description,
      scenes: scenesWithHotspots,
      default_scene_id: tour.default_scene_id,
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
    const body = await request.json()
    const {
      property_id,
      title,
      description,
      scenes,
      default_scene_id,
      settings
    } = body

    if (!property_id || !title || !scenes || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: property_id, title, scenes' },
        { status: 400 }
      )
    }

    // Start a transaction-like operation
    // First, create the virtual tour
    const { data: tour, error: tourError } = await supabase
      .from('virtual_tours')
      .insert({
        property_id,
        title,
        description,
        default_scene_id: default_scene_id || scenes[0]?.scene_id,
        settings: settings || {}
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
    const scenesToInsert = scenes.map((scene: any) => ({
      tour_id: tour.id,
      scene_id: scene.scene_id,
      name: scene.name,
      image_url: scene.image_url,
      description: scene.description,
      position: scene.position
    }))

    const { data: createdScenes, error: scenesError } = await supabase
      .from('virtual_tour_scenes')
      .insert(scenesToInsert)
      .select()

    if (scenesError) {
      console.error('Error creating scenes:', scenesError)
      // Clean up the tour if scenes creation failed
      await supabase.from('virtual_tours').delete().eq('id', tour.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create tour scenes' },
        { status: 500 }
      )
    }

    // Create hotspots if provided
    const hotspotsToInsert: any[] = []
    scenes.forEach((scene: any, index: number) => {
      if (scene.hotspots && scene.hotspots.length > 0) {
        const sceneRecord = createdScenes[index]
        scene.hotspots.forEach((hotspot: any) => {
          hotspotsToInsert.push({
            scene_id: sceneRecord.id,
            target_scene_id: hotspot.target_scene_id,
            position: hotspot.position,
            title: hotspot.title,
            description: hotspot.description,
            type: hotspot.type || 'navigation'
          })
        })
      }
    })

    if (hotspotsToInsert.length > 0) {
      const { error: hotspotsError } = await supabase
        .from('virtual_tour_hotspots')
        .insert(hotspotsToInsert)

      if (hotspotsError) {
        console.error('Error creating hotspots:', hotspotsError)
        // Don't fail the whole operation for hotspots, just log the error
      }
    }

    // Fetch the complete tour data
    const { data: completeTour, error: fetchError } = await supabase
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

    const { data: tour, error: tourError } = await supabase
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
    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('id')

    if (!tourId) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      )
    }

    // Delete the tour (cascading will handle scenes and hotspots)
    const { error: deleteError } = await supabase
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
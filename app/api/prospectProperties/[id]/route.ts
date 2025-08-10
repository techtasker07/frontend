import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import type { ProspectProperty, PropertyProspect } from "@/lib/api"

// @route   GET /api/prospectProperties/[id]
// @desc    Get a single prospect property with its AI prospects
// @access  Public
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid property ID",
      },
      { status: 400 },
    )
  }

  try {
    // Get the prospect property
    const propertyResult = await query<ProspectProperty>(
      `SELECT 
        pp.id, pp.title, pp.description, pp.location, pp.category_id,
        pp.estimated_worth, pp.year_of_construction, pp.image_url,
        pp.created_at, pp.updated_at,
        c.name AS category_name
       FROM prospect_properties pp
       JOIN categories c ON pp.category_id = c.id
       WHERE pp.id = $1`,
      [id],
    )

    if (propertyResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
        },
        { status: 404 },
      )
    }

    const property = propertyResult.rows[0]

    // Get the AI prospects for this property
    const prospectsResult = await query<PropertyProspect>(
      `SELECT id, prospect_property_id, title, description, estimated_cost, total_cost, created_at, updated_at
       FROM property_prospects
       WHERE prospect_property_id = $1
       ORDER BY created_at ASC`,
      [id],
    )

    const propertyWithProspects = {
      ...property,
      prospects: prospectsResult.rows,
    }

    return NextResponse.json({
      success: true,
      data: propertyWithProspects,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}

// @route   PUT /api/prospectProperties/[id]
// @desc    Update a prospect property
// @access  Private
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest)
  if (authResponse instanceof NextResponse) {
    return authResponse
  }

  const id = Number.parseInt(params.id)
  const updateData = await req.json()

  if (isNaN(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid property ID",
      },
      { status: 400 },
    )
  }

  try {
    // Build dynamic update query
    const updateFields = []
    const queryParams = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && key !== "id") {
        updateFields.push(`${key} = $${paramCount}`)
        queryParams.push(value)
        paramCount++
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid fields to update",
        },
        { status: 400 },
      )
    }

    updateFields.push("updated_at = NOW()")
    queryParams.push(id)

    const updateQuery = `
      UPDATE prospect_properties 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await query<ProspectProperty>(updateQuery, queryParams)

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}

// @route   DELETE /api/prospectProperties/[id]
// @desc    Delete a prospect property
// @access  Private
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest)
  if (authResponse instanceof NextResponse) {
    return authResponse
  }

  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid property ID",
      },
      { status: 400 },
    )
  }

  try {
    const result = await query<ProspectProperty>("DELETE FROM prospect_properties WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}

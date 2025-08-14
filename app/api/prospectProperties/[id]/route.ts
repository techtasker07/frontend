import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// @route   GET /api/prospectProperties/[id]
// @desc    Get a specific prospect property with its prospects
// @access  Public
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const propertyId = parseInt(params.id)

  // Validate propertyId
  if (isNaN(propertyId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid property ID",
      },
      { status: 400 },
    )
  }

  try {
    // Get the property with its prospects
    const result = await query(
      `SELECT 
        pp.id, pp.title, pp.description, pp.location, pp.category_id,
        pp.estimated_worth, pp.year_of_construction, pp.image_url,
        pp.created_at, pp.updated_at,
        c.name AS category_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pr.id,
              'title', pr.title,
              'description', pr.description,
              'estimated_cost', pr.estimated_cost,
              'total_cost', pr.total_cost,
              'created_at', pr.created_at,
              'updated_at', pr.updated_at
            )
          ) FILTER (WHERE pr.id IS NOT NULL), 
          '[]'
        ) AS prospects
      FROM prospect_properties pp
      JOIN categories c ON pp.category_id = c.id
      LEFT JOIN property_prospects pr ON pp.id = pr.prospect_property_id
      WHERE pp.id = $1
      GROUP BY pp.id, c.name`,
      [propertyId],
    )

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
  } catch (error: any) {
    console.error("Error fetching prospect property:", {
      propertyId,
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    })
    return NextResponse.json(
      {
        success: false,
        error: `Database error: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
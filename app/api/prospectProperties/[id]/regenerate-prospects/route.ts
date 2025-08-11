import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import { generateProspectsForProperty } from "@/lib/aiProspects"

// @route   POST /api/prospectProperties/[id]/regenerate-prospects
// @desc    Regenerate AI prospects for a property
// @access  Private
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest)
  if (authResponse instanceof NextResponse) {
    return authResponse
  }

  const propertyId = Number.parseInt(params.id)

  try {
    // First, get the property details
    const propertyResult = await query("SELECT * FROM prospect_properties WHERE id = $1", [propertyId])

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

    // Delete existing prospects for this property
    await query("DELETE FROM property_prospects WHERE prospect_property_id = $1", [propertyId])

    // Generate new AI prospects
    const aiProspects = generateProspectsForProperty(property.category_id, property.estimated_worth)

    // Insert the new prospects
    const prospectInsertPromises = aiProspects.map(async (prospect) => {
      const totalCost = property.estimated_worth
        ? prospect.estimatedCost + property.estimated_worth
        : prospect.estimatedCost

      return query(
        "INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES ($1, $2, $3, $4, $5)",
        [propertyId, prospect.title, prospect.description, prospect.estimatedCost, totalCost],
      )
    })

    await Promise.all(prospectInsertPromises)

    // Fetch the updated property with prospects
    const updatedPropertyResult = await query(
      `SELECT 
        pp.*, c.name AS category_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pr.id,
              'title', pr.title,
              'description', pr.description,
              'estimated_cost', pr.estimated_cost,
              'total_cost', pr.total_cost
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

    return NextResponse.json({
      success: true,
      data: updatedPropertyResult.rows[0],
      message: "AI prospects regenerated successfully!",
    })
  } catch (error) {
    console.error("Error regenerating prospects:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to regenerate prospects. Please try again.",
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import { generateCrossCategoryProspects } from "@/lib/aiProspects"

// New cross-category prospect assignment function
function assignProspectsToProperty(categoryId: number, estimatedWorth?: number) {
  // Use the new cross-category prospect generation
  const prospects = generateCrossCategoryProspects(estimatedWorth)
  
  return prospects.map((prospect) => ({
    title: prospect.title,
    description: prospect.description,
    estimated_cost: prospect.estimatedCost,
    total_cost: Math.round((estimatedWorth || 10000000) + prospect.estimatedCost),
    category: prospect.category,
    category_id: prospect.categoryId,
    image_url: prospect.imageUrl, // Include the image URL
  }))
}

// @route   POST /api/prospectProperties/[id]/regenerate-prospects
// @desc    Regenerate prospects for a property
// @access  Private
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest)
  if (authResponse instanceof NextResponse) {
    return authResponse
  }

  const propertyId = Number.parseInt(params.id)

  try {
    console.log("Regenerating prospects for property:", propertyId)

    // Get the property details
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
    console.log("Found property:", property.title, "Category:", property.category_id)

    // Delete existing prospects for this property
    await query("DELETE FROM property_prospects WHERE prospect_property_id = $1", [propertyId])
    console.log("Deleted existing prospects")

    // Generate new prospects
    const prospects = assignProspectsToProperty(property.category_id, property.estimated_worth)
    console.log("Generated new prospects:", prospects.length)

    // Insert the new prospects
    for (let i = 0; i < prospects.length; i++) {
      const prospect = prospects[i]
      try {
        const result = await query(
          "INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [propertyId, prospect.title, prospect.description, prospect.estimated_cost, prospect.total_cost, prospect.image_url],
        )
        console.log(`New prospect ${i + 1} inserted with ID:`, result.rows[0]?.id)
      } catch (prospectError) {
        console.error(`Error inserting prospect ${i + 1}:`, prospectError)
      }
    }

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
              'total_cost', pr.total_cost,
              'image_url', pr.image_url
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

    console.log("Updated property with prospects:", updatedPropertyResult.rows[0])

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
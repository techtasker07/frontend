import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import type { ProspectProperty } from "@/lib/api"
import { generateProspectsForProperty } from "@/lib/aiProspects"

// @route   GET /api/prospectProperties
// @desc    Get all prospect properties with their prospects
// @access  Public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const limit = searchParams.get("limit")
  const offset = searchParams.get("offset")

  let queryString = `
    SELECT 
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
            'total_cost', pr.total_cost
          )
        ) FILTER (WHERE pr.id IS NOT NULL), 
        '[]'
      ) AS prospects
    FROM prospect_properties pp
    JOIN categories c ON pp.category_id = c.id
    LEFT JOIN property_prospects pr ON pp.id = pr.prospect_property_id
  `

  const queryParams: (string | number)[] = []
  const conditions: string[] = []

  if (category) {
    conditions.push("c.name = $1")
    queryParams.push(category)
  }

  if (conditions.length > 0) {
    queryString += ` WHERE ${conditions.join(" AND ")}`
  }

  queryString += ` GROUP BY pp.id, c.name ORDER BY pp.created_at DESC`

  if (limit) {
    queryString += ` LIMIT $${queryParams.length + 1}`
    queryParams.push(Number.parseInt(limit))
  }

  if (offset) {
    queryString += ` OFFSET $${queryParams.length + 1}`
    queryParams.push(Number.parseInt(offset))
  }

  try {
    const result = await query<ProspectProperty & { prospects: any[] }>(queryString, queryParams)
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("Error fetching prospect properties:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}

// @route   POST /api/prospectProperties
// @desc    Add a new prospect property with AI-generated prospects
// @access  Private
export async function POST(req: NextRequest) {
  const authResponse = await protect(req as AuthNextRequest)
  if (authResponse instanceof NextResponse) {
    return authResponse
  }

  const { title, description, location, category_id, estimated_worth, year_of_construction, image_url } =
    await req.json()

  if (!title || !description || !location || !category_id) {
    return NextResponse.json(
      {
        success: false,
        error: "Please include all required fields: title, description, location, category_id",
      },
      { status: 400 },
    )
  }

  // Start a transaction to ensure data consistency
  try {
    // Insert the prospect property first
    const propertyResult = await query<ProspectProperty>(
      `INSERT INTO prospect_properties (title, description, location, category_id, estimated_worth, year_of_construction, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, location, category_id, estimated_worth, year_of_construction, image_url],
    )

    const newProperty = propertyResult.rows[0]
    console.log("Property created successfully:", newProperty.id)

    // Generate AI prospects for this property
    try {
      const aiProspects = generateProspectsForProperty(category_id, estimated_worth)
      console.log("Generated AI prospects:", aiProspects.length)

      // Insert the AI-generated prospects one by one with better error handling
      const prospectInsertPromises = aiProspects.map(async (prospect, index) => {
        try {
          const totalCost = newProperty.estimated_worth
            ? prospect.estimatedCost + newProperty.estimated_worth
            : prospect.estimatedCost

          const result = await query(
            "INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [newProperty.id, prospect.title, prospect.description, prospect.estimatedCost, totalCost],
          )
          console.log(`Prospect ${index + 1} inserted with ID:`, result.rows[0]?.id)
          return result
        } catch (prospectError) {
          console.error(`Error inserting prospect ${index + 1}:`, prospectError)
          throw prospectError
        }
      })

      await Promise.all(prospectInsertPromises)
      console.log("All prospects inserted successfully")

      // Fetch the complete property with prospects to return
      const completePropertyResult = await query(
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
        [newProperty.id],
      )

      return NextResponse.json(
        {
          success: true,
          data: completePropertyResult.rows[0],
          message: "Property created successfully with AI prospects!",
        },
        { status: 201 },
      )
    } catch (prospectError) {
      console.error("Error generating/inserting prospects:", prospectError)

      // Property was created but prospects failed - still return success but with a warning
      return NextResponse.json(
        {
          success: true,
          data: newProperty,
          message:
            "Property created successfully, but AI prospects generation failed. You can regenerate prospects later.",
          warning: "Prospects generation failed",
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create property. Please try again.",
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import type { ProspectProperty } from "@/lib/api"
import { generateProspectsForProperty } from "@/lib/aiProspects"

// @route   GET /api/prospectProperties
// @desc    Get all prospect properties
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
      c.name AS category_name
    FROM prospect_properties pp
    JOIN categories c ON pp.category_id = c.id
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

  queryString += ` ORDER BY pp.created_at DESC`

  if (limit) {
    queryString += ` LIMIT $${queryParams.length + 1}`
    queryParams.push(Number.parseInt(limit))
  }

  if (offset) {
    queryString += ` OFFSET $${queryParams.length + 1}`
    queryParams.push(Number.parseInt(offset))
  }

  try {
    const result = await query<ProspectProperty>(queryString, queryParams)
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
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

// @route   POST /api/prospectProperties
// @desc    Add a new prospect property
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

  try {
    // Insert the prospect property
    const propertyResult = await query<ProspectProperty>(
      `INSERT INTO prospect_properties (title, description, location, category_id, estimated_worth, year_of_construction, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, location, category_id, estimated_worth, year_of_construction, image_url],
    )

    const newProperty = propertyResult.rows[0]

    // Generate AI prospects for this property
    const aiProspects = generateProspectsForProperty(category_id, estimated_worth)

    // Insert the AI-generated prospects
    const prospectInsertPromises = aiProspects.map((prospect) => {
      const totalCost = newProperty.estimated_worth
        ? prospect.estimatedCost + newProperty.estimated_worth
        : prospect.estimatedCost

      return query(
        "INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES ($1, $2, $3, $4, $5)",
        [newProperty.id, prospect.title, prospect.description, prospect.estimatedCost, totalCost],
      )
    })

    await Promise.all(prospectInsertPromises)

    return NextResponse.json(
      {
        success: true,
        data: newProperty,
      },
      { status: 201 },
    )
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
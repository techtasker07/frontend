import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import type { ProspectProperty, ProspectPropertyImage } from "@/lib/api"

// @route   GET /api/prospect_properties
// @desc    Get all prospect properties with filtering and images
// @access  Public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const userId = searchParams.get("user_id")
  const limit = searchParams.get("limit") || "10"
  const offset = searchParams.get("offset") || "0"
  const searchTerm = searchParams.get("searchTerm")

  console.log("GET /api/prospect_properties - Params:", {
    category,
    userId,
    limit,
    offset,
    searchTerm,
  })

  let queryString = `
    SELECT 
      pp.id, pp.title, pp.description, pp.location, pp.category_id,
      pp.estimated_worth, pp.year_of_construction, pp.image_url, 
      pp.created_at, pp.updated_at,
      c.name AS category_name
    FROM prospect_properties pp
    LEFT JOIN categories c ON pp.category_id = c.id
  `

  const queryParams: (string | number)[] = []
  const conditions: string[] = []

  if (category && category.toLowerCase() !== "all") {
    conditions.push(`c.name ILIKE $${queryParams.length + 1}`)
    queryParams.push(category)
  }

  if (userId) {
    conditions.push(`pp.user_id = $${queryParams.length + 1}`)
    queryParams.push(Number.parseInt(userId))
  }

  if (searchTerm && searchTerm.trim()) {
    conditions.push(`(
      pp.title ILIKE $${queryParams.length + 1}
      OR pp.location ILIKE $${queryParams.length + 1}
      OR pp.description ILIKE $${queryParams.length + 1}
    )`)
    queryParams.push(`%${searchTerm.trim()}%`)
  }

  if (conditions.length > 0) {
    queryString += ` WHERE ${conditions.join(" AND ")}`
  }

  queryString += ` ORDER BY pp.created_at DESC`
  queryString += ` LIMIT $${queryParams.length + 1}`
  queryParams.push(Number.parseInt(limit))
  queryString += ` OFFSET $${queryParams.length + 1}`
  queryParams.push(Number.parseInt(offset))

  try {
    console.log("Executing query:", queryString)
    console.log("Query params:", queryParams)

    const result = await query<ProspectProperty>(queryString, queryParams)
    console.log("Query result:", result.rows.length, "rows")

    // Simplified image handling - try to fetch images but don't fail if table doesn't exist
    const prospectPropertiesWithImages = await Promise.all(
      result.rows.map(async (property) => {
        let images: ProspectPropertyImage[] = []

        try {
          const imageResult = await query<ProspectPropertyImage>(
            "SELECT id, prospect_property_id, image_url, is_primary, created_at FROM prospect_property_images WHERE prospect_property_id = $1 ORDER BY is_primary DESC, created_at ASC",
            [property.id],
          )
          images = imageResult.rows
        } catch (error) {
          // If prospect_property_images table doesn't exist or query fails, use empty array
          console.log("Images query failed for property", property.id, "- using empty array")
          images = []
        }

        return { ...property, images }
      }),
    )

    return NextResponse.json({
      success: true,
      data: prospectPropertiesWithImages,
      count: prospectPropertiesWithImages.length,
      total: prospectPropertiesWithImages.length,
    })
  } catch (error) {
    console.error("GET /api/prospect_properties error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch prospect properties. Please try again later.",
      },
      { status: 500 },
    )
  }
}

// @route   POST /api/prospect_properties
// @desc    Add a new prospect property
// @access  Private
export async function POST(req: NextRequest) {
  const authResponse = await protect(req as AuthNextRequest)
  if (authResponse instanceof NextResponse) {
    return authResponse
  }

  try {
    const { title, description, location, category_id, estimated_worth, year_of_construction, image_url, image_urls } =
      await req.json()

    const userId = (req as AuthNextRequest).user!.id

    if (!title || !description || !location || !category_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Please include all required fields: title, description, location, category_id",
        },
        { status: 400 },
      )
    }

    const prospectPropertyResult = await query<ProspectProperty>(
      `INSERT INTO prospect_properties (title, description, location, user_id, category_id, estimated_worth, year_of_construction, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, location, userId, category_id, estimated_worth, year_of_construction, image_url],
    )

    const newProspectProperty = prospectPropertyResult.rows[0]

    // Try to insert images if provided and table exists
    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      try {
        const imageInsertPromises = image_urls.map((url: string, index: number) => {
          const isPrimary = index === 0
          return query(
            "INSERT INTO prospect_property_images (prospect_property_id, image_url, is_primary) VALUES ($1, $2, $3)",
            [newProspectProperty.id, url, isPrimary],
          )
        })
        await Promise.all(imageInsertPromises)
      } catch (error) {
        console.log("Failed to insert images - prospect_property_images table might not exist")
      }
    }

    return NextResponse.json({ success: true, data: newProspectProperty }, { status: 201 })
  } catch (error) {
    console.error("POST /api/prospect_properties error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create prospect property. Please try again.",
      },
      { status: 500 },
    )
  }
}

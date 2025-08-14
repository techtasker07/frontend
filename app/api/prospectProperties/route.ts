import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import type { ProspectProperty } from "@/lib/api"

// Simple prospect assignment function
function assignProspectsToProperty(categoryId: number, estimatedWorth?: number) {
  // Define prospects for each category directly here for simplicity
  const categoryProspects: { [key: number]: Array<{ title: string; description: string; costFactor: number }> } = {
    1: [
      // Residential
      {
        title: "Short Let Plan",
        description:
          "Convert your residential property into a short-term rental for tourists, expatriates, or corporate guests. Works best in high-traffic cities like Lagos, Abuja, and Port Harcourt.",
        costFactor: 0.15,
      },
      {
        title: "Student Housing Investment",
        description:
          "Repurpose your residential building into a hostel or shared apartments targeting university students in areas like Ibadan, Nsukka, or Benin City.",
        costFactor: 0.25,
      },
      {
        title: "Family Rental Hub",
        description:
          "Transform your property into premium family housing with modern amenities targeting middle to upper-class families.",
        costFactor: 0.2,
      },
      {
        title: "Co-living Space",
        description:
          "Create a modern co-living space for young professionals and digital nomads with shared amenities and private rooms.",
        costFactor: 0.3,
      },
      {
        title: "Senior Living Facility",
        description:
          "Convert property into assisted living or senior-friendly housing with accessibility features and care services.",
        costFactor: 0.35,
      },
      {
        title: "Luxury Apartment Complex",
        description:
          "Develop high-end residential units with premium amenities targeting affluent tenants in prime locations.",
        costFactor: 0.4,
      },
    ],
    2: [
      // Commercial
      {
        title: "Tech Hub & Co-working Space",
        description:
          "Transform your commercial property into a modern co-working space targeting startups, freelancers, and remote workers.",
        costFactor: 0.25,
      },
      {
        title: "Retail Shopping Complex",
        description:
          "Develop a multi-tenant retail space with diverse shops, restaurants, and service providers in high-traffic areas.",
        costFactor: 0.3,
      },
      {
        title: "Medical Center Complex",
        description:
          "Convert property into a medical facility housing multiple healthcare providers, clinics, and diagnostic centers.",
        costFactor: 0.4,
      },
      {
        title: "Event & Conference Center",
        description:
          "Develop a versatile event space for weddings, corporate events, conferences, and social gatherings.",
        costFactor: 0.35,
      },
      {
        title: "Food Court & Restaurant Hub",
        description:
          "Develop a culinary destination with multiple restaurants, cafes, and food vendors in a shared dining environment.",
        costFactor: 0.35,
      },
      {
        title: "Fitness & Wellness Center",
        description:
          "Transform property into a comprehensive fitness facility with gym equipment, studios, and wellness services.",
        costFactor: 0.4,
      },
    ],
    3: [
      // Land/Agricultural
      {
        title: "Residential Estate Development",
        description:
          "Develop the land into a modern residential estate with multiple housing units, infrastructure, and amenities.",
        costFactor: 0.6,
      },
      {
        title: "Commercial Plaza Development",
        description: "Transform the land into a commercial plaza with shops, offices, and service centers.",
        costFactor: 0.7,
      },
      {
        title: "Smart Greenhouse Complex",
        description:
          "Develop climate-controlled greenhouse facilities for year-round production of high-value crops and vegetables.",
        costFactor: 0.4,
      },
      {
        title: "Mixed-Use Development",
        description: "Create a mixed-use development combining residential, commercial, and recreational spaces.",
        costFactor: 0.8,
      },
      {
        title: "Industrial Park Development",
        description:
          "Develop the land into an industrial park with manufacturing facilities, warehouses, and logistics centers.",
        costFactor: 0.5,
      },
      {
        title: "Recreation & Tourism Center",
        description:
          "Transform the land into a recreation center with parks, sports facilities, and tourism attractions.",
        costFactor: 0.45,
      },
    ],
  }

  // Get prospects for the category (default to land/agricultural if not found)
  const prospects = categoryProspects[categoryId] || categoryProspects[3]

  // Randomly select 4 prospects
  const shuffled = [...prospects].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, 4)

  // Calculate costs
  const baseWorth = estimatedWorth || 10000000 // Default 10M if no estimated worth

  return selected.map((prospect) => ({
    title: prospect.title,
    description: prospect.description,
    estimated_cost: Math.round(baseWorth * prospect.costFactor),
    total_cost: Math.round(baseWorth + baseWorth * prospect.costFactor),
  }))
}

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
  } catch (error: any) {
    console.error("Error fetching prospect properties:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
      query: queryString,
      params: queryParams,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DB_EXTERNAL_URL: process.env.DB_EXTERNAL_URL ? 'Present' : 'Missing',
        DB_HOST: process.env.DB_HOST ? 'Present' : 'Missing',
        DB_USER: process.env.DB_USER ? 'Present' : 'Missing',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'Present' : 'Missing',
        DB_NAME: process.env.DB_NAME ? 'Present' : 'Missing',
        DB_PORT: process.env.DB_PORT ? 'Present' : 'Missing',
      }
    })
    return NextResponse.json(
      {
        success: false,
        error: `Database error: ${error.message}`,
        details: error.code || 'Unknown error code'
      },
      { status: 500 },
    )
  }
}

// @route   POST /api/prospectProperties
// @desc    Add a new prospect property with manually assigned prospects
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
    console.log("Creating property with data:", {
      title,
      description,
      location,
      category_id,
      estimated_worth,
      year_of_construction,
      image_url,
    })

    // Insert the prospect property first
    const propertyResult = await query<ProspectProperty>(
      `INSERT INTO prospect_properties (title, description, location, category_id, estimated_worth, year_of_construction, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, location, category_id, estimated_worth, year_of_construction, image_url],
    )

    const newProperty = propertyResult.rows[0]
    console.log("Property created successfully:", newProperty.id)

    // Generate prospects manually
    const prospects = assignProspectsToProperty(category_id, estimated_worth)
    console.log("Generated prospects:", prospects.length)

    // Insert prospects one by one
    for (let i = 0; i < prospects.length; i++) {
      const prospect = prospects[i]
      try {
        const result = await query(
          "INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [newProperty.id, prospect.title, prospect.description, prospect.estimated_cost, prospect.total_cost],
        )
        console.log(`Prospect ${i + 1} inserted with ID:`, result.rows[0]?.id)
      } catch (prospectError) {
        console.error(`Error inserting prospect ${i + 1}:`, prospectError)
        // Continue with other prospects even if one fails
      }
    }

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

    console.log("Complete property with prospects:", completePropertyResult.rows[0])

    return NextResponse.json(
      {
        success: true,
        data: completePropertyResult.rows[0],
        message: "Property created successfully with manually assigned prospects!",
      },
      { status: 201 },
    )
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

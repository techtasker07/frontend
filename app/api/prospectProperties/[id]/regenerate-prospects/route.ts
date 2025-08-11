import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"

// Simple prospect assignment function (same as in main route)
function assignProspectsToProperty(categoryId: number, estimatedWorth?: number) {
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

  const prospects = categoryProspects[categoryId] || categoryProspects[3]
  const shuffled = [...prospects].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, 4)
  const baseWorth = estimatedWorth || 10000000

  return selected.map((prospect) => ({
    title: prospect.title,
    description: prospect.description,
    estimated_cost: Math.round(baseWorth * prospect.costFactor),
    total_cost: Math.round(baseWorth + baseWorth * prospect.costFactor),
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
          "INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [propertyId, prospect.title, prospect.description, prospect.estimated_cost, prospect.total_cost],
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

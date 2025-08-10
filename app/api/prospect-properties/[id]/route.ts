import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"
import random from "lodash.sample"

// Helper function to get prospect property details with category name
const getProspectPropertyDetails = async (prospectId: number) => {
  const result = await query(
    `SELECT pp.*, c.name AS category_name 
     FROM prospect_properties pp 
     LEFT JOIN categories c ON pp.category_id = c.id 
     WHERE pp.id = $1`,
    [prospectId],
  )
  return result.rows.length > 0 ? result.rows[0] : null
}

// Mock AI analysis function
const mockAIAnalysis = (property: any) => {
  const insights = [
    "This property shows strong potential for capital appreciation due to its location.",
    "Consider this property for long-term rental income, as demand in this area is stable.",
    "The estimated worth aligns with market trends, suggesting a fair valuation.",
    "Further due diligence on local zoning laws is recommended for this land prospect.",
    "The year of construction indicates potential for renovation projects to increase value.",
    "This commercial property could benefit from a strategic marketing overhaul.",
    "AI suggests exploring alternative uses for this material property to maximize returns.",
    "The property's description highlights unique features that could attract niche buyers.",
    "Market analysis indicates a slight undervaluation, presenting a good buying opportunity.",
    "Environmental factors should be thoroughly assessed before development.",
  ]

  const recommendations = [
    "Conduct a detailed feasibility study.",
    "Engage with local community planners.",
    "Obtain multiple appraisals.",
    "Explore financing options tailored to this property type.",
    "Develop a comprehensive marketing strategy.",
    "Assess environmental impact.",
    "Consider a joint venture for development.",
    "Review recent comparable sales in the area.",
    "Investigate potential tax incentives.",
    "Perform a structural integrity assessment.",
  ]

  const categorySpecificInsights: Record<string, string[]> = {
    Residential: [
      "Excellent for family living due to nearby schools.",
      "Potential for high rental yield in student housing.",
      "Requires minor cosmetic updates for optimal market appeal.",
    ],
    Commercial: [
      "High foot traffic area, suitable for retail.",
      "Good for office space, but parking might be a concern.",
      "Consider converting to a co-working space.",
    ],
    Land: [
      "Prime location for agricultural development.",
      "Suitable for solar farm installation.",
      "Potential for subdivision into multiple plots.",
    ],
    Material: [
      "High demand for this material in construction.",
      "Logistics for transport need careful planning.",
      "Consider processing this material further for higher value.",
    ],
  }

  const selectedInsights = Array(Math.floor(Math.random() * 3) + 2)
    .fill(null)
    .map(() => random(insights))
  if (property.category_name && categorySpecificInsights[property.category_name]) {
    selectedInsights.push(random(categorySpecificInsights[property.category_name]))
  }

  const selectedRecommendations = Array(Math.floor(Math.random() * 3) + 1)
    .fill(null)
    .map(() => random(recommendations))

  return {
    overall_sentiment: random(["Positive", "Neutral", "Negative"]),
    confidence_score: Number.parseFloat((Math.random() * (0.99 - 0.6) + 0.6).toFixed(2)),
    key_insights: selectedInsights,
    strategic_recommendations: selectedRecommendations,
    risk_factors: random([
      "Market volatility",
      "Regulatory changes",
      "Environmental concerns",
      "Economic downturn",
      "Competition",
      "None identified",
    ]),
    estimated_roi: `${(Math.random() * (30 - 5) + 5).toFixed(1)}%`,
    last_analyzed: new Date().toISOString(),
  }
}

// @route   GET /api/prospect_properties/:id
// @desc    Get single prospect property by ID with AI analysis (for authenticated users)
// @access  Public (AI analysis only for authenticated users)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const prospectId = Number.parseInt(params.id)

  if (isNaN(prospectId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid prospect property ID",
      },
      { status: 400 },
    )
  }

  console.log("GET /api/prospect_properties/[id] - ID:", prospectId)

  try {
    const prospectProperty = await getProspectPropertyDetails(prospectId)

    if (!prospectProperty) {
      return NextResponse.json(
        {
          success: false,
          error: "Prospect property not found",
        },
        { status: 404 },
      )
    }

    // Try to fetch images
    try {
      const imageResult = await query(
        "SELECT id, prospect_property_id, image_url, is_primary, created_at FROM prospect_property_images WHERE prospect_property_id = $1 ORDER BY is_primary DESC, created_at ASC",
        [prospectProperty.id],
      )
      prospectProperty.images = imageResult.rows
    } catch (error) {
      console.log("Images query failed - using empty array")
      prospectProperty.images = []
    }

    // Check if user is authenticated for AI analysis
    let isAuthenticated = false
    try {
      const authResponse = await protect(req as AuthNextRequest)
      isAuthenticated = !(authResponse instanceof NextResponse)
    } catch (error) {
      // User is not authenticated, that's fine
      isAuthenticated = false
    }

    // Add AI analysis only for authenticated users
    if (isAuthenticated) {
      const aiAnalysis = mockAIAnalysis(prospectProperty)
      prospectProperty.ai_analysis = aiAnalysis
    }

    console.log("Successfully fetched prospect property:", prospectProperty.id)
    return NextResponse.json({ success: true, data: prospectProperty })
  } catch (error) {
    console.error("GET /api/prospect_properties/[id] error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch prospect property details. Please try again.",
      },
      { status: 500 },
    )
  }
}

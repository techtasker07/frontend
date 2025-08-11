import { type NextRequest, NextResponse } from "next/server"

// Database connection - replace with your actual database configuration
const executeQuery = async (query: string, params: any[] = []) => {
  // This is a placeholder for your actual database connection
  console.log("Query:", query, "Params:", params)
  return []
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const propertyId = Number.parseInt(params.id)

    if (isNaN(propertyId)) {
      return NextResponse.json({ success: false, error: "Invalid property ID" }, { status: 400 })
    }

    // Check if property exists
    const propertyCheckQuery = "SELECT id FROM properties WHERE id = ?"
    const propertyExists = await executeQuery(propertyCheckQuery, [propertyId])

    if ((propertyExists as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Get vote statistics for the property
    const statsQuery = `
      SELECT 
        vo.id as vote_option_id,
        vo.name as option_name,
        COUNT(v.id) as vote_count,
        ROUND(
          (COUNT(v.id) * 100.0 / (
            SELECT COUNT(*) 
            FROM votes v2 
            WHERE v2.property_id = ?
          )), 2
        ) as percentage
      FROM vote_options vo
      LEFT JOIN votes v ON vo.id = v.vote_option_id AND v.property_id = ?
      INNER JOIN properties p ON p.category_id = vo.category_id
      WHERE p.id = ?
      GROUP BY vo.id, vo.name
      ORDER BY vote_count DESC, vo.name ASC
    `

    const statsRows = await executeQuery(statsQuery, [propertyId, propertyId, propertyId])

    // Get total votes for this property
    const totalVotesQuery = "SELECT COUNT(*) as total FROM votes WHERE property_id = ?"
    const totalVotesResult = await executeQuery(totalVotesQuery, [propertyId])
    const totalVotes = (totalVotesResult as any[])[0]?.total || 0

    // Process statistics
    const statistics = (statsRows as any[]).map((row) => ({
      vote_option_id: row.vote_option_id,
      option_name: row.option_name,
      vote_count: Number.parseInt(row.vote_count) || 0,
      percentage: Number.parseFloat(row.percentage) || 0,
    }))

    // If no votes exist, ensure all vote options show 0%
    if (totalVotes === 0) {
      statistics.forEach((stat) => {
        stat.percentage = 0
      })
    }

    const propertyStats = {
      statistics,
      total_votes: Number.parseInt(totalVotes),
    }

    return NextResponse.json({
      success: true,
      data: propertyStats,
    })
  } catch (error) {
    console.error("Error fetching property statistics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch property statistics" }, { status: 500 })
  }
}

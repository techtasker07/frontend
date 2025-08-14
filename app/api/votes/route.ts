import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { protect, type AuthNextRequest } from "@/lib/authUtils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const property_id = searchParams.get("property_id")
    const user_id = searchParams.get("user_id")
    const limit = searchParams.get("limit") || "50"
    const offset = searchParams.get("offset") || "0"

    // Build query with joins to get related data
    let queryString = `
      SELECT
        v.id,
        v.user_id,
        v.property_id,
        v.vote_option_id,
        v.created_at,
        u.first_name as voter_name,
        p.title as property_title,
        vo.name as vote_option_name
      FROM votes v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN properties p ON v.property_id = p.id
      LEFT JOIN vote_options vo ON v.vote_option_id = vo.id
    `

    const queryParams: any[] = []
    const conditions: string[] = []

    // Add filters
    if (property_id) {
      conditions.push(`v.property_id = $${queryParams.length + 1}`)
      queryParams.push(Number.parseInt(property_id))
    }

    if (user_id) {
      conditions.push(`v.user_id = $${queryParams.length + 1}`)
      queryParams.push(Number.parseInt(user_id))
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      queryString += ` WHERE ${conditions.join(" AND ")}`
    }

    // Add ORDER BY and LIMIT
    queryString += ` ORDER BY v.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(Number.parseInt(limit), Number.parseInt(offset))

    const result = await query(queryString, queryParams)

    const votes = result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      property_id: row.property_id,
      vote_option_id: row.vote_option_id,
      created_at: row.created_at,
      voter_name: row.voter_name,
      property_title: row.property_title,
      vote_option_name: row.vote_option_name,
    }))

    // Get total count
    let countQueryString = `
      SELECT COUNT(*) as total
      FROM votes v
    `

    const countParams: any[] = []
    if (conditions.length > 0) {
      countQueryString += ` WHERE ${conditions.join(" AND ")}`
      countParams.push(...queryParams.slice(0, -2)) // Exclude limit and offset
    }

    const countResult = await query(countQueryString, countParams)
    const total = countResult.rows[0]?.total || 0

    return NextResponse.json({
      success: true,
      data: votes,
      total: Number.parseInt(total),
      count: votes.length,
    })
  } catch (error) {
    console.error("Error fetching votes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch votes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Protect the route - require authentication
  const authResponse = await protect(request as AuthNextRequest)
  if (authResponse instanceof NextResponse) {
    return authResponse
  }

  try {
    const body = await request.json()
    const { property_id, vote_option_id } = body

    // Validate required fields
    if (!property_id || !vote_option_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: property_id and vote_option_id" },
        { status: 400 },
      )
    }

    // Get user_id from authentication
    const user_id = (request as AuthNextRequest).user!.id

    // Check if property exists
    const propertyCheckQuery = "SELECT id, category_id FROM properties WHERE id = $1"
    const propertyResult = await query(propertyCheckQuery, [Number.parseInt(property_id)])

    if (propertyResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    const property = propertyResult.rows[0]

    // Check if vote option exists and belongs to the property's category
    const voteOptionCheckQuery = `
      SELECT id, name, category_id
      FROM vote_options
      WHERE id = $1 AND category_id = $2
    `
    const voteOptionResult = await query(voteOptionCheckQuery, [
      Number.parseInt(vote_option_id),
      property.category_id,
    ])

    if (voteOptionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid vote option for this property category" },
        { status: 400 },
      )
    }

    // Check if user has already voted for this property
    const existingVoteQuery = "SELECT id FROM votes WHERE user_id = $1 AND property_id = $2"
    const existingVote = await query(existingVoteQuery, [user_id, Number.parseInt(property_id)])

    if (existingVote.rows.length > 0) {
      // Update existing vote instead of creating new one
      const updateVoteQuery = `
        UPDATE votes
        SET vote_option_id = $1, created_at = NOW()
        WHERE user_id = $2 AND property_id = $3
      `
      await query(updateVoteQuery, [Number.parseInt(vote_option_id), user_id, Number.parseInt(property_id)])

      const voteId = existingVote.rows[0].id

      // Get updated vote with related data
      const getVoteQuery = `
        SELECT
          v.id,
          v.user_id,
          v.property_id,
          v.vote_option_id,
          v.created_at,
          u.first_name as voter_name,
          p.title as property_title,
          vo.name as vote_option_name
        FROM votes v
        LEFT JOIN users u ON v.user_id = u.id
        LEFT JOIN properties p ON v.property_id = p.id
        LEFT JOIN vote_options vo ON v.vote_option_id = vo.id
        WHERE v.id = $1
      `

      const voteRows = await query(getVoteQuery, [voteId])
      const vote = voteRows.rows[0]

      return NextResponse.json({
        success: true,
        data: {
          id: vote.id,
          user_id: vote.user_id,
          property_id: vote.property_id,
          vote_option_id: vote.vote_option_id,
          created_at: vote.created_at,
          voter_name: vote.voter_name,
          property_title: vote.property_title,
          vote_option_name: vote.vote_option_name,
        },
        message: "Vote updated successfully",
      })
    } else {
      // Create new vote
      const insertVoteQuery = `
        INSERT INTO votes (user_id, property_id, vote_option_id, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `

      const result = await query(insertVoteQuery, [
        user_id,
        Number.parseInt(property_id),
        Number.parseInt(vote_option_id),
      ])

      const voteId = result.rows[0].id

      // Get created vote with related data
      const getVoteQuery = `
        SELECT
          v.id,
          v.user_id,
          v.property_id,
          v.vote_option_id,
          v.created_at,
          u.first_name as voter_name,
          p.title as property_title,
          vo.name as vote_option_name
        FROM votes v
        LEFT JOIN users u ON v.user_id = u.id
        LEFT JOIN properties p ON v.property_id = p.id
        LEFT JOIN vote_options vo ON v.vote_option_id = vo.id
        WHERE v.id = $1
      `

      const voteRows = await query(getVoteQuery, [voteId])
      const vote = voteRows.rows[0]

      return NextResponse.json({
        success: true,
        data: {
          id: vote.id,
          user_id: vote.user_id,
          property_id: vote.property_id,
          vote_option_id: vote.vote_option_id,
          created_at: vote.created_at,
          voter_name: vote.voter_name,
          property_title: vote.property_title,
          vote_option_name: vote.vote_option_name,
        },
        message: "Vote created successfully",
      })
    }
  } catch (error) {
    console.error("Error creating/updating vote:", error)
    return NextResponse.json({ success: false, error: "Failed to process vote" }, { status: 500 })
  }
}

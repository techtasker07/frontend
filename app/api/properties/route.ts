import { type NextRequest, NextResponse } from "next/server"

// You'll need to install and configure your database client
// For example: npm install mysql2 or pg for PostgreSQL
// import mysql from 'mysql2/promise'
// import { Pool } from 'pg'

// Database connection - replace with your actual database configuration
const executeQuery = async (query: string, params: any[] = []) => {
  // This is a placeholder for your actual database connection
  // Replace with your database client (MySQL, PostgreSQL, etc.)

  // Example for MySQL:
  // const connection = await mysql.createConnection({
  //   host: process.env.DB_HOST,
  //   user: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database: process.env.DB_NAME,
  // })
  // const [rows] = await connection.execute(query, params)
  // await connection.end()
  // return rows

  // For now, returning mock data structure
  console.log("Query:", query, "Params:", params)
  return []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const user_id = searchParams.get("user_id")
    const limit = searchParams.get("limit") || "20"
    const offset = searchParams.get("offset") || "0"

    // Build the base query with proper joins
    let query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.location,
        p.user_id,
        p.category_id,
        p.current_worth,
        p.year_of_construction,
        p.lister_phone_number,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        u.first_name as owner_name,
        u.email as owner_email,
        u.phone_number as owner_phone,
        u.profile_picture as owner_profile_picture,
        COUNT(DISTINCT v.id) as vote_count,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            pi.id, '|',
            pi.image_url, '|',
            pi.is_primary, '|',
            pi.created_at
          ) SEPARATOR ';;'
        ) as images_data
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN votes v ON p.id = v.property_id
      LEFT JOIN property_images pi ON p.id = pi.property_id
    `

    const queryParams: any[] = []
    const conditions: string[] = []

    // Add category filter
    if (category && category !== "all") {
      conditions.push("c.name = ?")
      queryParams.push(category)
    }

    // Add user filter
    if (user_id) {
      conditions.push("p.user_id = ?")
      queryParams.push(Number.parseInt(user_id))
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    // Add GROUP BY and ORDER BY
    query += `
      GROUP BY p.id, p.title, p.description, p.location, p.user_id, 
               p.category_id, p.current_worth, p.year_of_construction, 
               p.lister_phone_number, p.created_at, p.updated_at,
               c.name, u.first_name, u.email, u.phone_number, u.profile_picture
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `

    queryParams.push(Number.parseInt(limit), Number.parseInt(offset))

    // Execute the query
    const rows = await executeQuery(query, queryParams)

    // Process the results to format images properly
    const properties = (rows as any[]).map((row) => {
      const images: any[] = []

      if (row.images_data) {
        const imageStrings = row.images_data.split(";;")
        imageStrings.forEach((imageStr: string) => {
          const [id, image_url, is_primary, created_at] = imageStr.split("|")
          if (id && image_url) {
            images.push({
              id: Number.parseInt(id),
              property_id: row.id,
              image_url,
              is_primary: is_primary === "1" || is_primary === "true",
              created_at,
            })
          }
        })
      }

      // Sort images so primary image comes first
      images.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return 0
      })

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        location: row.location,
        user_id: row.user_id,
        category_id: row.category_id,
        current_worth: row.current_worth,
        year_of_construction: row.year_of_construction,
        lister_phone_number: row.lister_phone_number,
        created_at: row.created_at,
        updated_at: row.updated_at,
        owner_name: row.owner_name,
        owner_email: row.owner_email,
        owner_phone: row.owner_phone || row.lister_phone_number,
        owner_profile_picture: row.owner_profile_picture,
        category_name: row.category_name,
        vote_count: Number.parseInt(row.vote_count) || 0,
        images,
      }
    })

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
    `

    const countParams: any[] = []
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`
      // Add the same filter parameters (excluding limit/offset)
      countParams.push(...queryParams.slice(0, -2))
    }

    const countResult = await executeQuery(countQuery, countParams)
    const total = (countResult as any[])[0]?.total || 0

    return NextResponse.json({
      success: true,
      data: properties,
      total: Number.parseInt(total),
      count: properties.length,
    })
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      location,
      category_id,
      current_worth,
      year_of_construction,
      lister_phone_number,
      image_urls = [], // Array of uploaded image URLs
    } = body

    // Validate required fields
    if (!title || !description || !location || !category_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get user_id from authentication (you'll need to implement this)
    // For now, using a placeholder
    const user_id = 1 // Replace with actual authenticated user ID

    // Insert the property
    const insertPropertyQuery = `
      INSERT INTO properties (
        title, description, location, user_id, category_id, 
        current_worth, year_of_construction, lister_phone_number,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const propertyParams = [
      title,
      description,
      location,
      user_id,
      Number.parseInt(category_id),
      current_worth ? Number.parseFloat(current_worth) : null,
      year_of_construction ? Number.parseInt(year_of_construction) : null,
      lister_phone_number || null,
    ]

    const result = await executeQuery(insertPropertyQuery, propertyParams)
    const propertyId = (result as any).insertId

    // Insert images if provided
    if (image_urls && image_urls.length > 0) {
      const imageInsertPromises = image_urls.map((imageUrl: string, index: number) => {
        const insertImageQuery = `
          INSERT INTO property_images (property_id, image_url, is_primary, created_at)
          VALUES (?, ?, ?, NOW())
        `
        return executeQuery(insertImageQuery, [
          propertyId,
          imageUrl,
          index === 0, // First image is primary
        ])
      })

      await Promise.all(imageInsertPromises)
    }

    // Fetch the created property with all related data
    const getPropertyQuery = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.location,
        p.user_id,
        p.category_id,
        p.current_worth,
        p.year_of_construction,
        p.lister_phone_number,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        u.first_name as owner_name,
        u.email as owner_email,
        u.phone_number as owner_phone,
        u.profile_picture as owner_profile_picture,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            pi.id, '|',
            pi.image_url, '|',
            pi.is_primary, '|',
            pi.created_at
          ) SEPARATOR ';;'
        ) as images_data
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = ?
      GROUP BY p.id, p.title, p.description, p.location, p.user_id, 
               p.category_id, p.current_worth, p.year_of_construction, 
               p.lister_phone_number, p.created_at, p.updated_at,
               c.name, u.first_name, u.email, u.phone_number, u.profile_picture
    `

    const propertyRows = await executeQuery(getPropertyQuery, [propertyId])
    const propertyRow = (propertyRows as any[])[0]

    if (!propertyRow) {
      return NextResponse.json({ success: false, error: "Failed to retrieve created property" }, { status: 500 })
    }

    // Process images
    const images: any[] = []
    if (propertyRow.images_data) {
      const imageStrings = propertyRow.images_data.split(";;")
      imageStrings.forEach((imageStr: string) => {
        const [id, image_url, is_primary, created_at] = imageStr.split("|")
        if (id && image_url) {
          images.push({
            id: Number.parseInt(id),
            property_id: propertyRow.id,
            image_url,
            is_primary: is_primary === "1" || is_primary === "true",
            created_at,
          })
        }
      })
    }

    const createdProperty = {
      id: propertyRow.id,
      title: propertyRow.title,
      description: propertyRow.description,
      location: propertyRow.location,
      user_id: propertyRow.user_id,
      category_id: propertyRow.category_id,
      current_worth: propertyRow.current_worth,
      year_of_construction: propertyRow.year_of_construction,
      lister_phone_number: propertyRow.lister_phone_number,
      created_at: propertyRow.created_at,
      updated_at: propertyRow.updated_at,
      owner_name: propertyRow.owner_name,
      owner_email: propertyRow.owner_email,
      owner_phone: propertyRow.owner_phone || propertyRow.lister_phone_number,
      owner_profile_picture: propertyRow.owner_profile_picture,
      category_name: propertyRow.category_name,
      vote_count: 0,
      images: images.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return 0
      }),
    }

    return NextResponse.json({
      success: true,
      data: createdProperty,
      message: "Property created successfully",
    })
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ success: false, error: "Failed to create property" }, { status: 500 })
  }
}

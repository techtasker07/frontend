import { type NextRequest, NextResponse } from "next/server"

// Database connection - replace with your actual database configuration
const executeQuery = async (query: string, params: any[] = []) => {
  // This is a placeholder for your actual database connection
  // Replace with your database client (MySQL, PostgreSQL, etc.)
  console.log("Query:", query, "Params:", params)
  return []
}

// Mock database - In production, replace with actual database queries
const properties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    description: "Beautiful 2-bedroom apartment in the heart of downtown with stunning city views.",
    location: "Downtown, Lagos",
    user_id: 1,
    category_id: 1,
    current_worth: 45000000,
    year_of_construction: 2020,
    lister_phone_number: "+2348012345678",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    owner_name: "John Doe",
    owner_email: "john@example.com",
    owner_phone: "+2348012345678",
    owner_profile_picture: "/placeholder.svg",
    category_name: "Residential",
    vote_count: 15,
  },
]

const propertyImages = [
  {
    id: 1,
    property_id: 1,
    image_url: "/modern-apartment-living.png",
    is_primary: true,
    created_at: "2024-01-15T10:00:00Z",
  },
]

const categories = [
  { id: 1, name: "Residential" },
  { id: 2, name: "Commercial" },
  { id: 3, name: "Land" },
  { id: 4, name: "Material" },
]

const voteOptions = [
  { id: 1, name: "Undervalued", category_id: 1 },
  { id: 2, name: "Fairly Priced", category_id: 1 },
  { id: 3, name: "Overvalued", category_id: 1 },
  { id: 4, name: "Good Investment", category_id: 2 },
  { id: 5, name: "Poor Investment", category_id: 2 },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid property ID" }, { status: 400 })
    }

    // Get property with all related data including images, votes, and vote options
    const query = `
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
        ) as images_data,
        GROUP_CONCAT(
          DISTINCT CONCAT(
            vo.id, '|',
            vo.name
          ) SEPARATOR ';;'
        ) as vote_options_data
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN votes v ON p.id = v.property_id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      LEFT JOIN vote_options vo ON p.category_id = vo.category_id
      WHERE p.id = ?
      GROUP BY p.id, p.title, p.description, p.location, p.user_id, 
               p.category_id, p.current_worth, p.year_of_construction, 
               p.lister_phone_number, p.created_at, p.updated_at,
               c.name, u.first_name, u.email, u.phone_number, u.profile_picture
    `

    const rows = await executeQuery(query, [id])
    const propertyRow = (rows as any[])[0]

    if (!propertyRow) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
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

    // Process vote options
    const vote_options: any[] = []
    if (propertyRow.vote_options_data) {
      const voteOptionStrings = propertyRow.vote_options_data.split(";;")
      voteOptionStrings.forEach((voteOptionStr: string) => {
        const [id, name] = voteOptionStr.split("|")
        if (id && name) {
          vote_options.push({
            id: Number.parseInt(id),
            name,
            category_id: propertyRow.category_id,
          })
        }
      })
    }

    const property = {
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
      vote_count: Number.parseInt(propertyRow.vote_count) || 0,
      images: images.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return 0
      }),
      vote_options,
    }

    return NextResponse.json({
      success: true,
      data: property,
    })
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch property" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid property ID" }, { status: 400 })
    }

    // Check if property exists
    const checkQuery = "SELECT id FROM properties WHERE id = ?"
    const existingProperty = await executeQuery(checkQuery, [id])

    if ((existingProperty as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Build dynamic update query
    const updateFields: string[] = []
    const updateParams: any[] = []

    const allowedFields = [
      "title",
      "description",
      "location",
      "category_id",
      "current_worth",
      "year_of_construction",
      "lister_phone_number",
    ]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateParams.push(body[field])
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
    }

    // Add updated_at and property id
    updateFields.push("updated_at = NOW()")
    updateParams.push(id)

    const updateQuery = `
      UPDATE properties 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `

    await executeQuery(updateQuery, updateParams)

    // Fetch updated property
    const getUpdatedPropertyQuery = `
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
      WHERE p.id = ?
      GROUP BY p.id, p.title, p.description, p.location, p.user_id, 
               p.category_id, p.current_worth, p.year_of_construction, 
               p.lister_phone_number, p.created_at, p.updated_at,
               c.name, u.first_name, u.email, u.phone_number, u.profile_picture
    `

    const updatedRows = await executeQuery(getUpdatedPropertyQuery, [id])
    const updatedRow = (updatedRows as any[])[0]

    // Process images
    const images: any[] = []
    if (updatedRow.images_data) {
      const imageStrings = updatedRow.images_data.split(";;")
      imageStrings.forEach((imageStr: string) => {
        const [id, image_url, is_primary, created_at] = imageStr.split("|")
        if (id && image_url) {
          images.push({
            id: Number.parseInt(id),
            property_id: updatedRow.id,
            image_url,
            is_primary: is_primary === "1" || is_primary === "true",
            created_at,
          })
        }
      })
    }

    const updatedProperty = {
      id: updatedRow.id,
      title: updatedRow.title,
      description: updatedRow.description,
      location: updatedRow.location,
      user_id: updatedRow.user_id,
      category_id: updatedRow.category_id,
      current_worth: updatedRow.current_worth,
      year_of_construction: updatedRow.year_of_construction,
      lister_phone_number: updatedRow.lister_phone_number,
      created_at: updatedRow.created_at,
      updated_at: updatedRow.updated_at,
      owner_name: updatedRow.owner_name,
      owner_email: updatedRow.owner_email,
      owner_phone: updatedRow.owner_phone || updatedRow.lister_phone_number,
      owner_profile_picture: updatedRow.owner_profile_picture,
      category_name: updatedRow.category_name,
      vote_count: Number.parseInt(updatedRow.vote_count) || 0,
      images: images.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return 0
      }),
    }

    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: "Property updated successfully",
    })
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json({ success: false, error: "Failed to update property" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid property ID" }, { status: 400 })
    }

    // Check if property exists and get its data before deletion
    const getPropertyQuery = `
      SELECT p.*, c.name as category_name
      FROM properties p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `

    const propertyRows = await executeQuery(getPropertyQuery, [id])

    if ((propertyRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    const propertyToDelete = (propertyRows as any[])[0]

    // Delete related records first (due to foreign key constraints)
    // Delete votes
    await executeQuery("DELETE FROM votes WHERE property_id = ?", [id])

    // Delete property images
    await executeQuery("DELETE FROM property_images WHERE property_id = ?", [id])

    // Delete the property
    await executeQuery("DELETE FROM properties WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      data: propertyToDelete,
      message: "Property deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ success: false, error: "Failed to delete property" }, { status: 500 })
  }
}

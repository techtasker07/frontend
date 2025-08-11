import { type NextRequest, NextResponse } from "next/server"

// Mock data - replace with your actual database queries
const mockProperties = [
  {
    id: 1,
    title: "Modern 3-Bedroom Apartment",
    description:
      "Beautiful modern apartment with stunning city views, located in the heart of downtown. Features include hardwood floors, stainless steel appliances, and a spacious balcony.",
    location: "Downtown Lagos, Nigeria",
    user_id: 1,
    category_id: 1,
    current_worth: 45000000,
    year_of_construction: 2020,
    lister_phone_number: "+2348012345678",
    property_images: JSON.stringify([
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    ]),
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    owner_name: "John Doe",
    owner_email: "john@example.com",
    owner_phone: "+2348012345678",
    owner_profile_picture: "/placeholder.svg",
    category_name: "Residential",
    vote_count: 15,
  },
  {
    id: 2,
    title: "Commercial Office Space",
    description:
      "Prime commercial office space perfect for startups and established businesses. Located in a prestigious business district with excellent transport links.",
    location: "Victoria Island, Lagos",
    user_id: 2,
    category_id: 2,
    current_worth: 120000000,
    year_of_construction: 2018,
    lister_phone_number: "+2348087654321",
    property_images: JSON.stringify([
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    ]),
    created_at: "2024-01-14T14:20:00Z",
    updated_at: "2024-01-14T14:20:00Z",
    owner_name: "Jane Smith",
    owner_email: "jane@example.com",
    owner_phone: "+2348087654321",
    owner_profile_picture: "/placeholder.svg",
    category_name: "Commercial",
    vote_count: 8,
  },
  {
    id: 3,
    title: "Residential Land Plot",
    description:
      "Excellent residential land plot in a developing area. Perfect for building your dream home with easy access to schools, hospitals, and shopping centers.",
    location: "Lekki, Lagos",
    user_id: 3,
    category_id: 3,
    current_worth: 25000000,
    year_of_construction: null,
    lister_phone_number: "+2348098765432",
    property_images: JSON.stringify([
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    ]),
    created_at: "2024-01-13T09:15:00Z",
    updated_at: "2024-01-13T09:15:00Z",
    owner_name: "Mike Johnson",
    owner_email: "mike@example.com",
    owner_phone: "+2348098765432",
    owner_profile_picture: "/placeholder.svg",
    category_name: "Land",
    vote_count: 12,
  },
]

const mockCategories = [
  { id: 1, name: "Residential" },
  { id: 2, name: "Commercial" },
  { id: 3, name: "Land" },
  { id: 4, name: "Material" },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const user_id = searchParams.get("user_id")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredProperties = [...mockProperties]

    // Filter by category if specified
    if (category && category !== "all") {
      filteredProperties = filteredProperties.filter(
        (property) => property.category_name.toLowerCase() === category.toLowerCase(),
      )
    }

    // Filter by user_id if specified
    if (user_id) {
      filteredProperties = filteredProperties.filter((property) => property.user_id === Number.parseInt(user_id))
    }

    // Apply pagination
    const paginatedProperties = filteredProperties.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedProperties,
      total: filteredProperties.length,
      count: paginatedProperties.length,
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
      property_images,
    } = body

    // Validate required fields
    if (!title || !description || !location || !category_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Find category name
    const category = mockCategories.find((cat) => cat.id === category_id)
    const categoryName = category ? category.name : "Unknown"

    // Create new property (in real implementation, save to database)
    const newProperty = {
      id: mockProperties.length + 1,
      title,
      description,
      location,
      user_id: 1, // In real implementation, get from authenticated user
      category_id,
      current_worth: current_worth || null,
      year_of_construction: year_of_construction || null,
      lister_phone_number: lister_phone_number || null,
      property_images: property_images || null, // Store as JSON string
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_name: "Current User", // In real implementation, get from authenticated user
      owner_email: "user@example.com",
      owner_phone: lister_phone_number || "+2348000000000",
      owner_profile_picture: "/placeholder.svg",
      category_name: categoryName,
      vote_count: 0,
    }

    // Add to mock data (in real implementation, save to database)
    mockProperties.push(newProperty)

    return NextResponse.json({
      success: true,
      data: newProperty,
      message: "Property created successfully",
    })
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ success: false, error: "Failed to create property" }, { status: 500 })
  }
}

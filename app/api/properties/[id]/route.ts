import { type NextRequest, NextResponse } from "next/server"

// Mock data - same as in route.ts
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

const mockVoteOptions = [
  { id: 1, name: "Excellent Value", category_id: 1 },
  { id: 2, name: "Good Value", category_id: 1 },
  { id: 3, name: "Fair Value", category_id: 1 },
  { id: 4, name: "Overpriced", category_id: 1 },
  { id: 5, name: "Great Investment", category_id: 2 },
  { id: 6, name: "Good Investment", category_id: 2 },
  { id: 7, name: "Risky Investment", category_id: 2 },
  { id: 8, name: "Prime Location", category_id: 3 },
  { id: 9, name: "Good Location", category_id: 3 },
  { id: 10, name: "Average Location", category_id: 3 },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const property = mockProperties.find((p) => p.id === id)

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Get vote options for this property's category
    const voteOptions = mockVoteOptions.filter((option) => option.category_id === property.category_id)

    // Add vote options to property
    const propertyWithVoteOptions = {
      ...property,
      vote_options: voteOptions,
    }

    return NextResponse.json({
      success: true,
      data: propertyWithVoteOptions,
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

    const propertyIndex = mockProperties.findIndex((p) => p.id === id)

    if (propertyIndex === -1) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Update property (in real implementation, update in database)
    mockProperties[propertyIndex] = {
      ...mockProperties[propertyIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: mockProperties[propertyIndex],
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
    const propertyIndex = mockProperties.findIndex((p) => p.id === id)

    if (propertyIndex === -1) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Remove property (in real implementation, delete from database)
    const deletedProperty = mockProperties.splice(propertyIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedProperty,
      message: "Property deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ success: false, error: "Failed to delete property" }, { status: 500 })
  }
}

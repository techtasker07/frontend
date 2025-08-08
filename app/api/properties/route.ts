// Handles GET, PUT, DELETE for specific properties
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';

// Helper function to fetch property details with owner info, category, and vote count
const getPropertyDetails = async (propertyId: number) => {
  const propertyResult = await query(
    `SELECT
      p.*,
      u.first_name AS owner_first_name,
      u.last_name AS owner_last_name,
      u.email AS owner_email,
      u.phone_number AS owner_phone,
      c.name AS category_name,
      (SELECT COUNT(*) FROM votes WHERE property_id = p.id) AS vote_count
    FROM properties p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1`,
    [propertyId]
  );

  if (propertyResult.rows.length === 0) {
    return null;
  }

  const property = propertyResult.rows[0];

  // Fetch images
  const imagesResult = await query('SELECT id, image_url, is_primary FROM property_images WHERE property_id = $1 ORDER BY is_primary DESC, id ASC', [propertyId]);
  property.images = imagesResult.rows;

  // Fetch vote options for the property's category
  const voteOptionsResult = await query('SELECT id, name FROM vote_options WHERE category_id = $1', [property.category_id]);
  property.vote_options = voteOptionsResult.rows;

  // Combine owner name
  property.owner_name = `${property.owner_first_name} ${property.owner_last_name}`;
  delete property.owner_first_name;
  delete property.owner_last_name;

  return property;
};

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
  }

  try {
    const property = await getPropertyDetails(propertyId);
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private (owner only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
  }

  const userId = (req as AuthNextRequest).user!.id;
  const { title, description, location, category_id, current_worth, year_of_construction } = await req.json();

  try {
    const propertyResult = await query('SELECT user_id FROM properties WHERE id = $1', [propertyId]);
    if (propertyResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }
    if (propertyResult.rows[0].user_id !== userId) {
      return NextResponse.json({ success: false, error: 'Not authorized to update this property' }, { status: 403 });
    }

    const result = await query(
      `UPDATE properties
       SET title = $1, description = $2, location = $3, category_id = $4, current_worth = $5, year_of_construction = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [title, description, location, category_id, current_worth, year_of_construction, propertyId]
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private (owner only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
  }

  const userId = (req as AuthNextRequest).user!.id;

  try {
    const propertyResult = await query('SELECT user_id FROM properties WHERE id = $1', [propertyId]);
    if (propertyResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }
    if (propertyResult.rows[0].user_id !== userId) {
      return NextResponse.json({ success: false, error: 'Not authorized to delete this property' }, { status: 403 });
    }

    await query('DELETE FROM properties WHERE id = $1', [propertyId]);
    return NextResponse.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';
import { Property, PropertyImage } from '@/lib/api';

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
  }

  try {
    const propertyResult = await query<Property>(
      `SELECT
         p.id, p.title, p.description, p.location, p.user_id, p.category_id,
         p.current_worth, p.year_of_construction, p.created_at, p.updated_at, p.lister_phone_number,
         u.first_name || ' ' || u.last_name AS owner_name,
         u.email AS owner_email,
         u.phone_number AS owner_phone,
         u.profile_picture AS owner_profile_picture, -- Added owner_profile_picture
         c.name AS category_name
       FROM properties p
       JOIN users u ON p.user_id = u.id
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    const property = propertyResult.rows[0];

    // Fetch vote options for this property's category
    const voteOptionsResult = await query<any>(
      'SELECT id, name FROM vote_options WHERE category_id = $1',
      [property.category_id]
    );
    property.vote_options = voteOptionsResult.rows;

    // Fetch images for the property
    const imagesResult = await query<PropertyImage>(
      'SELECT id, property_id, image_url, is_primary, created_at FROM property_images WHERE property_id = $1 ORDER BY is_primary DESC, created_at ASC',
      [propertyId]
    );
    property.images = imagesResult.rows;

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

  const { title, description, location, category_id, current_worth, year_of_construction, lister_phone_number } = await req.json();
  const userId = (req as AuthNextRequest).user!.id;

  try {
    // Check if the user is the owner of the property
    const checkOwner = await query('SELECT user_id FROM properties WHERE id = $1', [propertyId]);
    if (checkOwner.rows.length === 0 || checkOwner.rows[0].user_id !== userId) {
      return NextResponse.json({ success: false, error: 'Not authorized to update this property' }, { status: 403 });
    }

    const result = await query<Property>(
      `UPDATE properties
       SET title = $1, description = $2, location = $3, category_id = $4, current_worth = $5, year_of_construction = $6, lister_phone_number = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, description, location, category_id, current_worth, year_of_construction, lister_phone_number, propertyId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

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
    // Check if the user is the owner of the property
    const checkOwner = await query('SELECT user_id FROM properties WHERE id = $1', [propertyId]);
    if (checkOwner.rows.length === 0 || checkOwner.rows[0].user_id !== userId) {
      return NextResponse.json({ success: false, error: 'Not authorized to delete this property' }, { status: 403 });
    }

    // Delete associated images first
    await query('DELETE FROM property_images WHERE property_id = $1', [propertyId]);
    // Delete associated votes
    await query('DELETE FROM votes WHERE property_id = $1', [propertyId]);

    const result = await query<Property>('DELETE FROM properties WHERE id = $1 RETURNING *', [propertyId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

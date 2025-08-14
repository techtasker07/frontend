import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';
import { Property, PropertyImage } from '@/lib/api';

// Handles GET /api/properties and POST /api/properties

// @route   GET /api/properties
// @desc    Get all properties or properties by category/user
// @access  Public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const userId = searchParams.get('user_id');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  let queryString = `
    SELECT
      p.id, p.title, p.description, p.location, p.user_id, p.category_id,
      p.current_worth, p.year_of_construction, p.created_at, p.updated_at, p.lister_phone_number,
      u.first_name || ' ' || u.last_name AS owner_name,
      u.email AS owner_email,
      u.phone_number AS owner_phone,
      u.profile_picture AS owner_profile_picture, -- Added owner_profile_picture
      c.name AS category_name,
      COUNT(v.id) AS vote_count
    FROM properties p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN votes v ON p.id = v.property_id
  `;
  const queryParams: (string | number)[] = [];
  const conditions: string[] = [];

  if (category) {
    conditions.push('c.name = $1');
    queryParams.push(category);
  }
  if (userId) {
    conditions.push(`p.user_id = $${queryParams.length + 1}`);
    queryParams.push(parseInt(userId));
  }

  if (conditions.length > 0) {
    queryString += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryString += ` GROUP BY p.id, u.id, c.id ORDER BY p.created_at DESC`;

  if (limit) {
    queryString += ` LIMIT $${queryParams.length + 1}`;
    queryParams.push(parseInt(limit));
  }
  if (offset) {
    queryString += ` OFFSET $${queryParams.length + 1}`;
    queryParams.push(parseInt(offset));
  }

  try {
    const result = await query<Property>(queryString, queryParams);

    // Fetch images for each property
    const propertiesWithImages = await Promise.all(result.rows.map(async (property) => {
      const imageResult = await query<PropertyImage>(
        'SELECT id, property_id, image_url, is_primary, created_at FROM property_images WHERE property_id = $1 ORDER BY is_primary DESC, created_at ASC',
        [property.id]
      );
      return { ...property, images: imageResult.rows };
    }));

    return NextResponse.json({ success: true, data: propertiesWithImages, count: propertiesWithImages.length });
  } catch (error: any) {
    console.error('Properties route error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
      query: queryString,
      params: queryParams,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DB_EXTERNAL_URL: process.env.DB_EXTERNAL_URL ? 'Present' : 'Missing',
        DB_HOST: process.env.DB_HOST ? 'Present' : 'Missing',
        DB_USER: process.env.DB_USER ? 'Present' : 'Missing',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'Present' : 'Missing',
        DB_NAME: process.env.DB_NAME ? 'Present' : 'Missing',
        DB_PORT: process.env.DB_PORT ? 'Present' : 'Missing',
      }
    });
    return NextResponse.json({
      success: false,
      error: `Database error: ${error.message}`,
      details: error.code || 'Unknown error code'
    }, { status: 500 });
  }
}

// @route   POST /api/properties
// @desc    Add a new property
// @access  Private
export async function POST(req: NextRequest) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const { title, description, location, category_id, current_worth, year_of_construction, lister_phone_number, image_urls } = await req.json();
  const userId = (req as AuthNextRequest).user!.id;

  if (!title || !description || !location || !category_id) {
    return NextResponse.json({ success: false, error: 'Please include all required fields: title, description, location, category_id' }, { status: 400 });
  }

  try {
    const propertyResult = await query<Property>(
      `INSERT INTO properties (title, description, location, user_id, category_id, current_worth, year_of_construction, lister_phone_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, location, userId, category_id, current_worth, year_of_construction, lister_phone_number]
    );

    const newProperty = propertyResult.rows[0];

    // Insert images if provided
    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      const imageInsertPromises = image_urls.map((url: string, index: number) => {
        const isPrimary = index === 0; // First image is primary
        return query(
          'INSERT INTO property_images (property_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [newProperty.id, url, isPrimary]
        );
      });
      await Promise.all(imageInsertPromises);
    }

    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
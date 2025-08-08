// Handles GET /api/properties and POST /api/properties
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';

// Helper function to fetch primary image URL
const getPrimaryImageUrl = async (propertyId: number): Promise<string | null> => {
  const imageResult = await query('SELECT image_url FROM property_images WHERE property_id = $1 AND is_primary = TRUE LIMIT 1', [propertyId]);
  return imageResult.rows.length > 0 ? imageResult.rows[0].image_url : null;
};

// @route   GET /api/properties
// @desc    Get all properties (with optional filters)
// @access  Public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const user_id = searchParams.get('user_id');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  let queryText = `
    SELECT
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
  `;
  const queryParams: (string | number)[] = [];
  const conditions = [];

  if (category) {
    conditions.push(`c.name ILIKE $${conditions.length + 1}`);
    queryParams.push(category);
  }
  if (user_id) {
    conditions.push(`p.user_id = $${conditions.length + 1}`);
    queryParams.push(parseInt(user_id));
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ` ORDER BY p.created_at DESC`;

  if (limit) {
    queryText += ` LIMIT $${conditions.length + 1}`;
    queryParams.push(parseInt(limit));
  }
  if (offset) {
    queryText += ` OFFSET $${conditions.length + 1}`;
    queryParams.push(parseInt(offset));
  }

  try {
    const result = await query(queryText, queryParams);
    const properties = await Promise.all(result.rows.map(async p => {
      const primary_image_url = await getPrimaryImageUrl(p.id);
      return {
        ...p,
        owner_name: `${p.owner_first_name} ${p.owner_last_name}`,
        images: primary_image_url ? [{ image_url: primary_image_url, is_primary: true }] : [],
      };
    }));
    return NextResponse.json({ success: true, data: properties, count: properties.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   POST /api/properties
// @desc    Create a new property
// @access  Private
export async function POST(req: NextRequest) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const { title, description, location, category_id, current_worth, year_of_construction } = await req.json();
  const user_id = (req as AuthNextRequest).user!.id; // User is guaranteed to exist after protect

  if (!title || !description || !location || !category_id) {
    return NextResponse.json({ success: false, error: 'Please include all required fields' }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO properties (title, description, location, user_id, category_id, current_worth, year_of_construction)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, location, user_id, category_id, current_worth, year_of_construction]
    );
    const newProperty = result.rows[0];
    return NextResponse.json({ success: true, data: newProperty }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

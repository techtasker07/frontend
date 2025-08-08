// Handles GET /api/prospect_properties and POST /api/prospect_properties
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';

// @route   GET /api/prospect_properties
// @desc    Get all prospect properties (accessible to logged-in users)
// @access  Private (for full details), Public (for preview)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const category = searchParams.get('category');

  let queryText = `
    SELECT pp.*, c.name AS category_name
    FROM prospect_properties pp
    JOIN categories c ON pp.category_id = c.id
  `;
  const queryParams: (string | number)[] = [];
  const conditions = [];

  if (category) {
    conditions.push(`c.name ILIKE $${conditions.length + 1}`);
    queryParams.push(category);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ` ORDER BY pp.created_at DESC`;

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
    return NextResponse.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   POST /api/prospect_properties
// @desc    Create a new prospect property (accessible to logged-in users)
// @access  Private
export async function POST(req: NextRequest) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const { title, description, location, category_id, estimated_worth, year_of_construction, image_url } = await req.json();

  if (!title || !description || !location || !category_id) {
    return NextResponse.json({ success: false, error: 'Please include all required fields' }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO prospect_properties (title, description, location, category_id, estimated_worth, year_of_construction, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, location, category_id, estimated_worth, year_of_construction, image_url]
    );
    const newProspect = result.rows[0];
    return NextResponse.json({ success: true, data: newProspect }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// Handles GET /api/vote_options/category/:categoryId
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// @route   GET /api/vote_options/category/:categoryId
// @desc    Get vote options by category ID
// @access  Public
export async function GET(req: NextRequest, { params }: { params: { categoryId: string } }) {
  const categoryId = parseInt(params.categoryId);
  if (isNaN(categoryId)) {
    return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
  }
  try {
    const result = await query('SELECT id, name FROM vote_options WHERE category_id = $1 ORDER BY name', [categoryId]);
    return NextResponse.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// Handles GET /api/vote_options
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// @route   GET /api/vote_options
// @desc    Get all vote options
// @access  Public
export async function GET(req: NextRequest) {
  try {
    const result = await query('SELECT vo.*, c.name AS category_name FROM vote_options vo JOIN categories c ON vo.category_id = c.id ORDER BY vo.name');
    return NextResponse.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

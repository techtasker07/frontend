  // Handles GET /api/categories
  import { NextRequest, NextResponse } from 'next/server';
  import { query } from '@/lib/db';

  // @route   GET /api/categories
  // @desc    Get all categories
  // @access  Public
  export async function GET(req: NextRequest) {
    try {
      const result = await query('SELECT * FROM categories ORDER BY name');
      return NextResponse.json({ success: true, data: result.rows, count: result.rows.length });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
  }

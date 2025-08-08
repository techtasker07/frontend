// Handles GET /api/votes/property/:propertyId
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';

// @route   GET /api/votes/property/:propertyId
// @desc    Get votes for a specific property
// @access  Private (only logged-in users can see votes)
export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const propertyId = parseInt(params.propertyId);
  if (isNaN(propertyId)) {
    return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT
         v.*,
         u.first_name AS voter_first_name,
         u.last_name AS voter_last_name,
         p.title AS property_title,
         vo.name AS vote_option_name
       FROM votes v
       JOIN users u ON v.user_id = u.id
       JOIN properties p ON v.property_id = p.id
       JOIN vote_options vo ON v.vote_option_id = vo.id
       WHERE v.property_id = $1
       ORDER BY v.created_at DESC`,
      [propertyId]
    );
    const votes = result.rows.map(v => ({
      ...v,
      voter_name: `${v.voter_first_name} ${v.voter_last_name}`,
    }));
    return NextResponse.json({ success: true, data: votes, count: votes.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

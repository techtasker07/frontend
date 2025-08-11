// Handles GET for property statistics
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// @route   GET /api/properties/:id/stats
// @desc    Get voting statistics for a property
// @access  Public
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
  }

  try {
    const totalVotesResult = await query('SELECT COUNT(*) FROM votes WHERE property_id = $1', [propertyId]);
    const total_votes = parseInt(totalVotesResult.rows[0].count, 10);

    const statsResult = await query(
      `SELECT
         vo.name AS option_name,
         vo.id AS vote_option_id,
         COUNT(v.id) AS vote_count
       FROM votes v
       JOIN vote_options vo ON v.vote_option_id = vo.id
       WHERE v.property_id = $1
       GROUP BY vo.id, vo.name
       ORDER BY vote_count DESC`,
      [propertyId]
    );

    const statistics = statsResult.rows.map(row => ({
      option_name: row.option_name,
      vote_option_id: row.vote_option_id,
      vote_count: parseInt(row.vote_count, 10),
      percentage: total_votes > 0 ? parseFloat(((parseInt(row.vote_count, 10) / total_votes) * 100).toFixed(2)) : 0,
    }));

    return NextResponse.json({ success: true, data: { statistics, total_votes } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
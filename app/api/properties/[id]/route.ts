// Handles GET for a single property (with stats merged)
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// @route   GET /api/properties/:id
// @desc    Get property by ID with voting stats
// @access  Public
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const propertyId = parseInt(params.id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ success: false, error: 'Invalid property ID' }, { status: 400 });
  }

  try {
    // Fetch property + owner + category + vote count
    const propertyResult = await query(
      `SELECT
         p.id, p.title, p.description, p.location, p.user_id, p.category_id,
         p.current_worth, p.year_of_construction, p.created_at, p.updated_at, p.lister_phone_number,
         u.first_name || ' ' || u.last_name AS owner_name,
         u.email AS owner_email,
         u.phone_number AS owner_phone,
         u.profile_picture AS owner_profile_picture,
         c.name AS category_name,
         COUNT(v.id) AS vote_count
       FROM properties p
       JOIN users u ON p.user_id = u.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN votes v ON p.id = v.property_id
       WHERE p.id = $1
       GROUP BY p.id, u.first_name, u.last_name, u.email, u.phone_number, u.profile_picture, c.name`,
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    const property = propertyResult.rows[0];

    // Fetch detailed voting statistics
    const totalVotesResult = await query(
      `SELECT COUNT(*) FROM votes WHERE property_id = $1`,
      [propertyId]
    );
    const total_votes = parseInt(totalVotesResult.rows[0].count, 10);

    const statsResult = await query(
      `SELECT
         vo.name AS option_name,
         vo.id AS vote_option_id,
         COUNT(v.id) AS vote_count
       FROM vote_options vo
       LEFT JOIN votes v ON vo.id = v.vote_option_id AND v.property_id = $1
       GROUP BY vo.id, vo.name
       ORDER BY vote_count DESC`,
      [propertyId]
    );

    const statistics = statsResult.rows.map(row => ({
      option_name: row.option_name,
      vote_option_id: row.vote_option_id,
      vote_count: parseInt(row.vote_count, 10),
      percentage: total_votes > 0
        ? parseFloat(((parseInt(row.vote_count, 10) / total_votes) * 100).toFixed(2))
        : 0,
    }));

    // Return property + stats merged
    return NextResponse.json({
      success: true,
      data: {
        ...property,
        total_votes,
        statistics,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

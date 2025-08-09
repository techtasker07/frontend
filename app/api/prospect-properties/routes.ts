import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';
import { ProspectProperty, ProspectPropertyImage } from '@/lib/api'; // Add these types if they don't exist

// Handles GET /api/prospect_properties and POST /api/prospect_properties

// @route   GET /api/prospect_properties
// @desc    Get all prospect properties with filtering and images
// @access  Public
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const userId = searchParams.get('user_id');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const searchTerm = searchParams.get('searchTerm');

  let queryString = `
    SELECT
      pp.id, pp.title, pp.description, pp.location, pp.category_id,
      pp.estimated_worth, pp.year_of_construction, pp.image_url, pp.created_at, pp.updated_at,
      c.name AS category_name
    FROM prospect_properties pp
    JOIN categories c ON pp.category_id = c.id
  `;
  const queryParams: (string | number)[] = [];
  const conditions: string[] = [];

  if (category && category.toLowerCase() !== 'all') {
    conditions.push('c.name = $1');
    queryParams.push(category);
  }
  
  if (userId) {
    conditions.push(`pp.user_id = $${queryParams.length + 1}`);
    queryParams.push(parseInt(userId));
  }

  if (searchTerm) {
    conditions.push(`(
      pp.title ILIKE $${queryParams.length + 1}
      OR pp.location ILIKE $${queryParams.length + 1}
      OR pp.description ILIKE $${queryParams.length + 1}
    )`);
    queryParams.push(`%${searchTerm}%`);
  }

  if (conditions.length > 0) {
    queryString += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryString += ` ORDER BY pp.created_at DESC`;

  if (limit) {
    queryString += ` LIMIT $${queryParams.length + 1}`;
    queryParams.push(parseInt(limit));
  }
  if (offset) {
    queryString += ` OFFSET $${queryParams.length + 1}`;
    queryParams.push(parseInt(offset));
  }

  try {
    const result = await query<ProspectProperty>(queryString, queryParams);

    // Fetch images for each prospect property (if you have a prospect_property_images table)
    const prospectPropertiesWithImages = await Promise.all(result.rows.map(async (property) => {
      // Try to fetch from prospect_property_images table first
      let images: ProspectPropertyImage[] = [];
      try {
        const imageResult = await query<ProspectPropertyImage>(
          'SELECT id, prospect_property_id, image_url, is_primary, created_at FROM prospect_property_images WHERE prospect_property_id = $1 ORDER BY is_primary DESC, created_at ASC',
          [property.id]
        );
        images = imageResult.rows;
      } catch (error) {
        // If prospect_property_images table doesn't exist, create empty array
        console.log('prospect_property_images table might not exist, using image_url field');
        images = [];
      }
      
      return { ...property, images };
    }));

    return NextResponse.json({ 
      success: true, 
      data: prospectPropertiesWithImages, 
      count: prospectPropertiesWithImages.length 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   POST /api/prospect_properties
// @desc    Add a new prospect property
// @access  Private
export async function POST(req: NextRequest) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const { 
    title, 
    description, 
    location, 
    category_id, 
    estimated_worth, 
    year_of_construction, 
    image_url, // Keep for backward compatibility
    image_urls  // New array support
  } = await req.json();
  
  const userId = (req as AuthNextRequest).user!.id;

  if (!title || !description || !location || !category_id) {
    return NextResponse.json({ 
      success: false, 
      error: 'Please include all required fields: title, description, location, category_id' 
    }, { status: 400 });
  }

  try {
    const prospectPropertyResult = await query<ProspectProperty>(
      `INSERT INTO prospect_properties (title, description, location, user_id, category_id, estimated_worth, year_of_construction, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, location, userId, category_id, estimated_worth, year_of_construction, image_url]
    );

    const newProspectProperty = prospectPropertyResult.rows[0];

    // Insert images if provided (for new multiple image support)
    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      try {
        const imageInsertPromises = image_urls.map((url: string, index: number) => {
          const isPrimary = index === 0; // First image is primary
          return query(
            'INSERT INTO prospect_property_images (prospect_property_id, image_url, is_primary) VALUES ($1, $2, $3)',
            [newProspectProperty.id, url, isPrimary]
          );
        });
        await Promise.all(imageInsertPromises);
      } catch (error) {
        console.log('prospect_property_images table might not exist, using image_url field only');
      }
    }

    return NextResponse.json({ success: true, data: newProspectProperty }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
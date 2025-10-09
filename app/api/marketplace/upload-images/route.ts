import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { marketplaceListingId, images } = await request.json();

    console.log('Server: Received request with data:', { marketplaceListingId, imagesCount: images?.length });

    if (!marketplaceListingId || !images || !Array.isArray(images)) {
      console.error('Server: Invalid request data');
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    console.log(`Server: Starting upload of ${images.length} images for listing ${marketplaceListingId}`);

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error('Server: NEXT_PUBLIC_SUPABASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let supabaseClient;
    if (supabaseServiceKey) {
      console.log('Server: Using service role key');
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } else {
      console.warn('Server: SUPABASE_SERVICE_ROLE_KEY not configured, using anon key');
      supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }

    const imageInserts = [];

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];

      if (!imageData.url) {
        console.error(`Server: Missing URL for image ${i + 1}`);
        continue;
      }

      imageInserts.push({
        marketplace_listing_id: marketplaceListingId,
        image_url: imageData.url,
        is_primary: i === 0, // First image is primary
        display_order: i
      });

      console.log(`Server: Prepared image record ${i + 1} with URL: ${imageData.url}`);
    }

    if (imageInserts.length === 0) {
      console.error('Server: No valid images to insert');
      return NextResponse.json(
        { error: 'No valid images to upload' },
        { status: 400 }
      );
    }

    console.log('Server: Inserting image records into database:', imageInserts);

    // Insert image records
    const { data: insertData, error: insertError } = await supabaseClient
      .from('marketplace_images')
      .insert(imageInserts)
      .select();

    if (insertError) {
      console.error('Server: Image insert error:', insertError);
      console.error('Server: Error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return NextResponse.json(
        { error: `Failed to save image records: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log('Server: Successfully inserted image records:', insertData);

    return NextResponse.json({
      success: true,
      message: `Uploaded ${imageInserts.length} image(s) successfully!`,
      data: insertData
    });

  } catch (error: any) {
    console.error('Server: Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
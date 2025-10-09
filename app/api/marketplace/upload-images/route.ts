import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { marketplaceListingId, images } = await request.json();

    if (!marketplaceListingId || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    console.log(`Server: Starting upload of ${images.length} images for listing ${marketplaceListingId}`);

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
      return NextResponse.json(
        { error: 'No valid images to upload' },
        { status: 400 }
      );
    }

    console.log('Server: Inserting image records into database:', imageInserts);

    // Insert image records using server-side client (bypasses RLS)
    const { data: insertData, error: insertError } = await supabaseServer
      .from('marketplace_images')
      .insert(imageInserts)
      .select();

    if (insertError) {
      console.error('Server: Image insert error:', insertError);
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
    console.error('Server: Image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
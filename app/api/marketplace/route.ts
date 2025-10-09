import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Creating marketplace listing:', body);

    const result = await supabaseApi.createMarketplaceListing(body);

    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      console.error('Failed to create listing:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create listing' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = {
      category: searchParams.get('category') || undefined,
      listing_type: searchParams.get('listing_type') || undefined,
      property_type: searchParams.get('property_type') || undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      location: searchParams.get('location') || undefined,
      bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
      bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
      is_featured: searchParams.get('is_featured') === 'true' ? true : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const result = await supabaseApi.getMarketplaceListings(params);

    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch listings' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
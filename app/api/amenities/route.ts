import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: amenities, error } = await supabase
      .from('amenities')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching amenities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch amenities' },
        { status: 500 }
      );
    }

    // Group amenities by category
    const groupedAmenities = amenities.reduce((acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    }, {} as Record<string, typeof amenities>);

    return NextResponse.json({
      success: true,
      data: groupedAmenities
    });
  } catch (error) {
    console.error('Error in amenities API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
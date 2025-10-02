const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl, supabaseAnonKey;
for (const line of envLines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseAnonKey = line.split('=')[1].trim();
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixListingTypes() {
  console.log('Fixing listing types and property types...');

  try {
    // Get unique listing_type_ids and property_type_ids from marketplace listings
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('listing_type_id, property_type_id, category_id');

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return;
    }

    const uniqueListingTypeIds = [...new Set(listings.map(l => l.listing_type_id))];
    const uniquePropertyTypeIds = [...new Set(listings.map(l => l.property_type_id))];
    const uniqueCategoryIds = [...new Set(listings.map(l => l.category_id))];

    console.log('Unique listing_type_ids:', uniqueListingTypeIds);
    console.log('Unique property_type_ids:', uniquePropertyTypeIds);
    console.log('Unique category_ids:', uniqueCategoryIds);

    // Insert listing types with known IDs
    const listingTypes = [
      { id: '650e8400-e29b-41d4-a716-446655440001', name: 'For Sale' },
      { id: '650e8400-e29b-41d4-a716-446655440002', name: 'For Rent' },
      { id: '650e8400-e29b-41d4-a716-446655440003', name: 'For Lease' },
      { id: '650e8400-e29b-41d4-a716-446655440004', name: 'For Booking' }
    ];

    for (const type of listingTypes) {
      const { error } = await supabase
        .from('listing_types')
        .upsert(type, { onConflict: 'id' });

      if (error) {
        console.error(`Error inserting listing type ${type.name}:`, error);
      } else {
        console.log(`✓ Inserted listing type: ${type.name}`);
      }
    }

    // Get categories to map property types
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    // Create property types for each unique property_type_id found
    // We'll map them to appropriate categories based on the listings
    const propertyTypeInserts = [];

    for (const listing of listings) {
      const categoryName = categoryMap[listing.category_id];
      if (categoryName && !propertyTypeInserts.find(pt => pt.id === listing.property_type_id)) {
        let name = 'Property'; // default
        if (categoryName === 'Residential') {
          name = 'Apartment'; // most common
        } else if (categoryName === 'Commercial') {
          name = 'Office Space';
        } else if (categoryName === 'Land') {
          name = 'Residential Land';
        }

        propertyTypeInserts.push({
          id: listing.property_type_id,
          category_id: listing.category_id,
          name: name
        });
      }
    }

    // Insert property types
    for (const propType of propertyTypeInserts) {
      const { error } = await supabase
        .from('property_types')
        .upsert(propType, { onConflict: 'id' });

      if (error) {
        console.error(`Error inserting property type ${propType.name}:`, error);
      } else {
        console.log(`✓ Inserted property type: ${propType.name} for category ${categoryMap[propType.category_id]}`);
      }
    }

    console.log('✅ Listing types and property types fixed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixListingTypes();
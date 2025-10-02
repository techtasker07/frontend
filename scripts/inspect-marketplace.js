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

async function inspectMarketplace() {
  console.log('Inspecting marketplace listings...');

  try {
    // Get marketplace listings
    const { data: listings, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching listings:', error);
      return;
    }

    console.log('Marketplace listings:');
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. ID: ${listing.id}`);
      console.log(`   Title: ${listing.title}`);
      console.log(`   listing_type_id: ${listing.listing_type_id}`);
      console.log(`   property_type_id: ${listing.property_type_id}`);
      console.log(`   category_id: ${listing.category_id}`);
      console.log(`   Images count: ${listing.marketplace_images?.length || 0}`);
      console.log('');
    });

    // Try to get one listing with joins
    if (listings.length > 0) {
      console.log('Trying to fetch first listing with joins...');
      const { data: listingWithJoins, error: joinError } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          listing_type:listing_types!marketplace_listings_listing_type_id_fkey (
            name
          ),
          property_type:property_types!marketplace_listings_property_type_id_fkey (
            name
          ),
          category:categories!marketplace_listings_category_id_fkey (
            name
          ),
          images:marketplace_images (
            id,
            image_url,
            is_primary,
            caption,
            display_order
          )
        `)
        .eq('id', listings[0].id)
        .single();

      if (joinError) {
        console.error('Join error:', joinError);
      } else {
        console.log('Listing with joins:', JSON.stringify(listingWithJoins, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Inspection failed:', error);
  }
}

inspectMarketplace();
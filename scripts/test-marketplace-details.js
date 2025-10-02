const { supabaseApi } = require('../lib/supabase-api.ts');

async function testMarketplaceDetails() {
  console.log('Testing marketplace listing details...');

  try {
    // Get all marketplace listings first
    const listingsResponse = await supabaseApi.getMarketplaceListings();
    if (!listingsResponse.success || listingsResponse.data.length === 0) {
      console.error('No marketplace listings found');
      return;
    }

    const firstListing = listingsResponse.data[0];
    console.log('Testing with listing ID:', firstListing.id);
    console.log('Listing title:', firstListing.title);

    // Test getMarketplaceListing
    const detailResponse = await supabaseApi.getMarketplaceListing(firstListing.id);

    if (detailResponse.success) {
      const listing = detailResponse.data;
      console.log('✅ Successfully fetched listing details');
      console.log('Title:', listing.title);
      console.log('Description:', listing.description?.substring(0, 100) + '...');
      console.log('Price:', listing.price);
      console.log('Currency:', listing.currency);
      console.log('Location:', listing.location);
      console.log('Category:', listing.category?.name);
      console.log('Listing Type:', listing.listing_type?.name);
      console.log('Property Type:', listing.property_type?.name);
      console.log('Images count:', listing.images?.length || 0);
      console.log('Bedrooms:', listing.bedrooms);
      console.log('Bathrooms:', listing.bathrooms);
      console.log('Amenities:', listing.amenities);

      if (listing.images && listing.images.length > 0) {
        console.log('First image URL:', listing.images[0].image_url);
      }
    } else {
      console.error('❌ Failed to fetch listing details:', detailResponse.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMarketplaceDetails();
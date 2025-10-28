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

async function seedMarketplaceWithVirtualTour() {
  console.log('Seeding marketplace with virtual tour data...');

  try {
    // First, get existing data
    const { data: categories } = await supabase.from('categories').select('*');
    const { data: listingTypes } = await supabase.from('listing_types').select('*');
    const { data: propertyTypes } = await supabase.from('property_types').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*').limit(1);

    if (!categories.length || !listingTypes.length || !propertyTypes.length || !profiles.length) {
      console.error('Missing required data. Please run setup scripts first.');
      return;
    }

    console.log('Found existing data:', {
      categories: categories.length,
      listingTypes: listingTypes.length,
      propertyTypes: propertyTypes.length,
      profiles: profiles.length
    });

    // Create a sample marketplace listing with virtual tour
    const residentialCategory = categories.find(c => c.name === 'Residential');
    const saleType = listingTypes.find(lt => lt.name === 'For Sale');
    const apartmentType = propertyTypes.find(pt => pt.name === 'Apartment' && pt.category_id === residentialCategory.id);

    if (!residentialCategory || !saleType || !apartmentType) {
      console.error('Missing required types');
      return;
    }

    const sampleListing = {
      user_id: profiles[0].id,
      title: 'Luxury 3BR Apartment with Virtual Tour',
      description: 'Experience this stunning 3-bedroom apartment through our immersive virtual tour. Located in the heart of Victoria Island, this property features modern amenities, ocean views, and premium finishes throughout.',
      location: 'Victoria Island, Lagos',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria',
      listing_type_id: saleType.id,
      property_type_id: apartmentType.id,
      category_id: residentialCategory.id,
      price: 250000000, // ₦250M
      currency: 'NGN',
      price_period: 'one-time',
      property_condition: 'excellent',
      property_size: 'Large and Spacious',
      area_sqft: 1800,
      area_sqm: 167,
      year_of_construction: 2022,
      bedrooms: 3,
      bathrooms: 3,
      toilets: 4,
      kitchen_size: 'Large',
      dining_room: true,
      balcony_terrace: true,
      furnishing_status: 'semi-furnished',
      parking_spaces: 2,
      pet_friendly: true,
      contact_name: 'John Adebayo',
      contact_phone: '+234-801-234-5678',
      contact_email: 'john.adebayo@luxuryproperties.ng',
      contact_whatsapp: '+234-801-234-5678',
      amenities: JSON.stringify([
        '24/7 Security',
        'Swimming Pool',
        'Gym',
        'Generator',
        'Elevator',
        'Concierge Service',
        'Ocean View',
        'Smart Home Features'
      ]),
      keywords: JSON.stringify([
        'luxury',
        'ocean view',
        '3 bedroom',
        'victoria island',
        'modern',
        'virtual tour'
      ]),
      is_featured: true,
      is_active: true,
      views_count: 45,
      virtual_tour_url: '550e8400-e29b-41d4-a716-446655440000' // Sample virtual tour ID
    };

    console.log('Creating sample marketplace listing...');
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .insert(sampleListing)
      .select()
      .single();

    if (listingError) {
      console.error('Error creating listing:', listingError);
      return;
    }

    console.log('✅ Created marketplace listing:', listing.title);
    console.log('📍 Listing ID:', listing.id);
    console.log('🎯 Virtual Tour URL:', listing.virtual_tour_url);

    // Create sample images for the listing
    const sampleImages = [
      {
        marketplace_listing_id: listing.id,
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        is_primary: true,
        caption: 'Living Room',
        display_order: 1
      },
      {
        marketplace_listing_id: listing.id,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        is_primary: false,
        caption: 'Master Bedroom',
        display_order: 2
      },
      {
        marketplace_listing_id: listing.id,
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        is_primary: false,
        caption: 'Kitchen',
        display_order: 3
      },
      {
        marketplace_listing_id: listing.id,
        image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop',
        is_primary: false,
        caption: 'Balcony View',
        display_order: 4
      }
    ];

    console.log('Creating sample images...');
    const { data: images, error: imagesError } = await supabase
      .from('marketplace_images')
      .insert(sampleImages)
      .select();

    if (imagesError) {
      console.error('Error creating images:', imagesError);
    } else {
      console.log(`✅ Created ${images.length} sample images`);
    }

    console.log('\n🎉 Marketplace seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Created listing: ${listing.title}`);
    console.log(`   • Virtual tour enabled: ${!!listing.virtual_tour_url}`);
    console.log(`   • Images added: ${images?.length || 0}`);
    console.log(`   • Listing URL: /marketplace/${listing.id}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedMarketplaceWithVirtualTour();
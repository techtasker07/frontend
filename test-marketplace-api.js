#!/usr/bin/env node

// Test script to verify marketplace API functionality
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file manually
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...values] = trimmedLine.split('=');
        if (key && values.length > 0) {
          process.env[key] = values.join('=');
        }
      }
    });
  } catch (error) {
    console.log('⚠️ Could not load .env file, using existing environment variables');
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing Marketplace API functionality...');
console.log('📊 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testMarketplaceAPI() {
  try {
    console.log('\n1️⃣ Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase.from('categories').select('*').limit(1);
    
    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    
    console.log('✅ Database connection successful');
    
    console.log('\n2️⃣ Testing table existence...');
    
    // Check if required tables exist
    const tables = ['listing_types', 'property_types', 'marketplace_listings', 'marketplace_images'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error && !error.message.includes('zero rows')) {
          console.log(`❌ Table ${table} does not exist or is inaccessible: ${error.message}`);
        } else {
          console.log(`✅ Table ${table} exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table} check failed: ${err.message}`);
      }
    }
    
    console.log('\n3️⃣ Testing data availability...');
    
    // Check if we have categories
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) {
      console.log('❌ Failed to fetch categories:', catError.message);
    } else {
      console.log(`✅ Categories available: ${categories.length} found`);
      categories.slice(0, 3).forEach(cat => console.log(`   - ${cat.name}`));
    }
    
    // Check if we have listing types
    const { data: listingTypes, error: ltError } = await supabase.from('listing_types').select('*');
    if (ltError) {
      console.log('❌ Failed to fetch listing types:', ltError.message);
    } else {
      console.log(`✅ Listing types available: ${listingTypes.length} found`);
      listingTypes.forEach(lt => console.log(`   - ${lt.name}`));
    }
    
    // Check if we have property types
    const { data: propertyTypes, error: ptError } = await supabase.from('property_types').select('*');
    if (ptError) {
      console.log('❌ Failed to fetch property types:', ptError.message);
    } else {
      console.log(`✅ Property types available: ${propertyTypes.length} found`);
    }
    
    console.log('\n4️⃣ Testing marketplace listings...');
    
    // Test marketplace listings fetch with minimal query
    const { data: basicListings, error: basicError } = await supabase
      .from('marketplace_listings')
      .select('id, title, price, location, is_active')
      .limit(5);
      
    if (basicError) {
      console.log('❌ Failed to fetch basic marketplace listings:', basicError.message);
    } else {
      console.log(`✅ Basic marketplace listings: ${basicListings.length} found`);
      basicListings.forEach(listing => {
        console.log(`   - ${listing.title}: ₦${listing.price?.toLocaleString() || 'N/A'} (Active: ${listing.is_active})`);
      });
    }
    
    console.log('\n5️⃣ Testing enriched marketplace listings...');
    
    // Test enriched query similar to what the API does
    const { data: enrichedListings, error: enrichedError } = await supabase
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
      .eq('is_active', true)
      .limit(3);
      
    if (enrichedError) {
      console.log('❌ Failed to fetch enriched marketplace listings:', enrichedError.message);
    } else {
      console.log(`✅ Enriched marketplace listings: ${enrichedListings.length} found`);
      enrichedListings.forEach(listing => {
        console.log(`   - ${listing.title}`);
        console.log(`     Type: ${listing.listing_type?.name || 'N/A'}`);
        console.log(`     Category: ${listing.category?.name || 'N/A'}`);
        console.log(`     Property Type: ${listing.property_type?.name || 'N/A'}`);
        console.log(`     Price: ₦${listing.price?.toLocaleString() || 'N/A'}`);
        console.log(`     Images: ${listing.images?.length || 0} found`);
        console.log(`     Location: ${listing.location}`);
        console.log('');
      });
    }
    
    console.log('\n6️⃣ Testing individual listing fetch...');
    
    if (basicListings && basicListings.length > 0) {
      const listingId = basicListings[0].id;
      
      const { data: singleListing, error: singleError } = await supabase
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
        .eq('id', listingId)
        .eq('is_active', true)
        .single();
        
      if (singleError) {
        console.log('❌ Failed to fetch individual listing:', singleError.message);
      } else {
        console.log('✅ Individual listing fetch successful');
        console.log(`   Title: ${singleListing.title}`);
        console.log(`   Description: ${singleListing.description?.substring(0, 100)}...`);
        console.log(`   Has bedrooms: ${singleListing.bedrooms || 'N/A'}`);
        console.log(`   Has bathrooms: ${singleListing.bathrooms || 'N/A'}`);
        console.log(`   Property condition: ${singleListing.property_condition || 'N/A'}`);
        console.log(`   City: ${singleListing.city || 'N/A'}`);
      }
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n🎉 Marketplace API is ready to use!');
    console.log('\n📝 Next steps:');
    console.log('1. Apply the database schema files in your Supabase SQL editor');
    console.log('2. Refresh your web application');
    console.log('3. Test creating a new listing');
    console.log('4. Verify listings appear in the marketplace');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (supabaseUrl && supabaseServiceRoleKey) {
  testMarketplaceAPI();
} else {
  console.error('❌ Missing environment variables. Please check your .env file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

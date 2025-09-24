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

async function testDatabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Key present:', !!supabaseAnonKey);

  try {
    // Test 1: Check categories
    console.log('\n1. Testing categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
      
    if (categoriesError) {
      console.error('Categories error:', categoriesError);
    } else {
      console.log(`Found ${categories.length} categories:`, categories.map(c => c.name));
    }

    // Test 2: Check listing types
    console.log('\n2. Testing listing_types...');
    const { data: listingTypes, error: listingTypesError } = await supabase
      .from('listing_types')
      .select('*');
      
    if (listingTypesError) {
      console.error('Listing types error:', listingTypesError);
    } else {
      console.log(`Found ${listingTypes.length} listing types:`, listingTypes.map(lt => lt.name));
    }

    // Test 3: Check property types
    console.log('\n3. Testing property_types...');
    const { data: propertyTypes, error: propertyTypesError } = await supabase
      .from('property_types')
      .select('*');
      
    if (propertyTypesError) {
      console.error('Property types error:', propertyTypesError);
    } else {
      console.log(`Found ${propertyTypes.length} property types:`, propertyTypes.map(pt => pt.name));
    }

    // Test 4: Check marketplace_listings
    console.log('\n4. Testing marketplace_listings...');
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .limit(5);
      
    if (listingsError) {
      console.error('Marketplace listings error:', listingsError);
    } else {
      console.log(`Found ${listings.length} marketplace listings`);
      if (listings.length === 0) {
        console.log('No marketplace listings found - database might be empty');
      }
    }

    // Test 5: Check properties
    console.log('\n5. Testing properties...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(5);
      
    if (propertiesError) {
      console.error('Properties error:', propertiesError);
    } else {
      console.log(`Found ${properties.length} properties`);
    }

    console.log('\n✅ Database connection test completed');

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

testDatabaseConnection();

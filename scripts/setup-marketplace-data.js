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

async function setupMarketplaceData() {
  console.log('Setting up marketplace data...');

  try {
    // Get existing categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    console.log('Found categories:', categories.map(c => ({ id: c.id, name: c.name })));

    // Step 1: Insert listing types
    console.log('\n1. Creating listing types...');
    const listingTypes = [
      { name: 'For Sale' },
      { name: 'For Rent' },
      { name: 'For Lease' },
      { name: 'For Booking' }
    ];

    const { data: listingTypesInsert, error: listingTypesError } = await supabase
      .from('listing_types')
      .insert(listingTypes)
      .select();
      
    if (listingTypesError) {
      console.error('Error inserting listing types:', listingTypesError);
    } else {
      console.log(`✓ Created ${listingTypesInsert.length} listing types`);
    }

    // Step 2: Insert property types for each category
    console.log('\n2. Creating property types...');
    
    // Find specific categories
    const residential = categories.find(c => c.name === 'Residential');
    const commercial = categories.find(c => c.name === 'Commercial');
    const land = categories.find(c => c.name === 'Land');
    
    if (!residential || !commercial || !land) {
      console.error('Missing required categories');
      return;
    }

    const propertyTypes = [
      // Residential
      { category_id: residential.id, name: 'Apartment' },
      { category_id: residential.id, name: 'House' },
      { category_id: residential.id, name: 'Villa' },
      { category_id: residential.id, name: 'Duplex' },
      { category_id: residential.id, name: 'Studio' },
      
      // Commercial
      { category_id: commercial.id, name: 'Office Space' },
      { category_id: commercial.id, name: 'Retail Shop' },
      { category_id: commercial.id, name: 'Restaurant' },
      { category_id: commercial.id, name: 'Warehouse' },
      
      // Land
      { category_id: land.id, name: 'Residential Land' },
      { category_id: land.id, name: 'Commercial Land' },
      { category_id: land.id, name: 'Agricultural Land' }
    ];

    const { data: propertyTypesInsert, error: propertyTypesError } = await supabase
      .from('property_types')
      .insert(propertyTypes)
      .select();
      
    if (propertyTypesError) {
      console.error('Error inserting property types:', propertyTypesError);
    } else {
      console.log(`✓ Created ${propertyTypesInsert.length} property types`);
    }

    // Step 3: Get existing properties
    console.log('\n3. Getting existing properties...');
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .limit(5);

    console.log(`Found ${properties.length} properties to create listings for`);

    // Step 4: Get the created listing types and property types
    const { data: createdListingTypes } = await supabase
      .from('listing_types')
      .select('*');
      
    const { data: createdPropertyTypes } = await supabase
      .from('property_types')
      .select('*');

    // Step 5: Create sample marketplace listings
    console.log('\n4. Creating sample marketplace listings...');
    
    if (properties.length > 0 && createdListingTypes.length > 0 && createdPropertyTypes.length > 0) {
      const saleListingType = createdListingTypes.find(lt => lt.name === 'For Sale');
      const rentListingType = createdListingTypes.find(lt => lt.name === 'For Rent');
      
      for (let i = 0; i < Math.min(properties.length, 5); i++) {
        const property = properties[i];
        
        // Find a suitable property type for this property's category
        const propertyType = createdPropertyTypes.find(pt => pt.category_id === property.category_id);
        
        if (!propertyType) {
          console.log(`No property type found for property ${property.id}, skipping...`);
          continue;
        }

        const listingType = i % 2 === 0 ? saleListingType : rentListingType;
        const basePrice = property.current_worth || 1000000;
        const price = listingType.name === 'For Sale' ? basePrice : Math.floor(basePrice * 0.1); // 10% of value for rent
        
        const marketplaceListing = {
          property_id: property.id,
          listing_type_id: listingType.id,
          property_type_id: propertyType.id,
          price: price,
          currency: 'NGN',
          price_period: listingType.name === 'For Sale' ? null : 'monthly',
          bedrooms: Math.floor(Math.random() * 4) + 1, // 1-4 bedrooms
          bathrooms: Math.floor(Math.random() * 3) + 1, // 1-3 bathrooms
          area_sqft: Math.floor(Math.random() * 2000) + 500, // 500-2500 sqft
          parking_spaces: Math.floor(Math.random() * 3), // 0-2 parking spaces
          amenities: JSON.stringify(['WiFi', 'AC', 'Security']),
          utilities_included: Math.random() > 0.5,
          is_featured: i < 2, // First 2 are featured
          is_active: true,
          views_count: Math.floor(Math.random() * 100),
          contact_phone: '+234-XXX-XXX-XXXX',
          contact_email: 'contact@example.com'
        };

        const { data, error } = await supabase
          .from('marketplace_listings')
          .insert(marketplaceListing)
          .select();

        if (error) {
          console.error(`Error creating marketplace listing for property ${property.id}:`, error);
        } else {
          console.log(`✓ Created marketplace listing for: ${property.title}`);
        }
      }
    }

    console.log('\n✅ Marketplace data setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupMarketplaceData();

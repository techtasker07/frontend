// Using Node.js 18+ built-in fetch

async function testMarketplaceCreation() {
  console.log('🧪 Testing Marketplace Listing Creation...\n');

  // Test data for marketplace listing
  const testData = {
    // Basic Information
    title: 'Test Modern 3-Bedroom Apartment',
    description: 'A beautiful modern apartment in a prime location with excellent amenities.',
    location: 'Victoria Island, Lagos',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',

    // Property Details
    listing_type_id: 'sale', // For Sale
    property_type_id: 'res-apartment', // Apartment
    category_id: 'residential', // Residential
    price: '50000000', // 50 million NGN
    currency: 'NGN',
    price_period: 'one-time',
    property_condition: 'excellent',
    property_size: 'Spacious',
    area_sqft: '1500',
    area_sqm: '139',
    year_of_construction: '2020',

    // Residential Fields
    bedrooms: '3',
    bathrooms: '2',
    toilets: '3',
    kitchen_size: 'Large',
    dining_room: true,
    balcony_terrace: true,
    furnishing_status: 'semi-furnished',
    parking_spaces: '2',
    pet_friendly: true,
    appliances_included: ['air_conditioning', 'washing_machine'],
    security_features: ['cctv', 'security_guard'],
    neighbourhood_features: ['shopping_center', 'hospital'],

    // Contact Information
    contact_name: 'John Doe',
    contact_phone: '+2341234567890',
    contact_email: 'john.doe@example.com',
    contact_whatsapp: '+2341234567890',

    // General Fields
    amenities: ['wifi', 'generator', 'parking'],
    keywords: ['modern', 'luxury', 'prime_location']
  };

  console.log('📤 Sending test data to API...');
  console.log('Request payload:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:8080/api/marketplace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      try {
        const responseData = JSON.parse(responseText);
        console.log('✅ Success! Response data:', JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        console.log('✅ Success! Raw response:', responseText);
      }
    } else {
      console.log('❌ Error response:', responseText);
      try {
        const errorData = JSON.parse(responseText);
        console.log('Parsed error:', JSON.stringify(errorData, null, 2));
      } catch (parseError) {
        console.log('Raw error response:', responseText);
      }
    }

  } catch (error) {
    console.error('💥 Network error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testMarketplaceCreation().catch(console.error);
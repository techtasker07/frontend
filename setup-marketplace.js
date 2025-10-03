#!/usr/bin/env node

// Node.js script to set up marketplace database tables
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file manually
const fs = require('fs');
const path = require('path');

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

console.log('🚀 Setting up marketplace database tables...');
console.log('📊 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupMarketplaceSchema() {
  try {
    console.log('1️⃣ Setting up listing_types table...');
    
    // Create listing_types table
    const listingTypesSQL = `
      CREATE TABLE IF NOT EXISTS public.listing_types (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
      
      -- Enable RLS
      ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      DROP POLICY IF EXISTS "Anyone can view listing types" ON public.listing_types;
      CREATE POLICY "Anyone can view listing types" ON public.listing_types
        FOR SELECT USING (true);
      
      -- Insert default listing types
      INSERT INTO public.listing_types (name) VALUES
        ('For Sale'),
        ('For Rent'),
        ('For Lease'),
        ('For Booking')
      ON CONFLICT (name) DO NOTHING;
    `;
    
    const { error: listingTypesError } = await supabase.rpc('exec_sql', { sql: listingTypesSQL });
    if (listingTypesError) {
      console.error('❌ Error creating listing_types:', listingTypesError);
      throw listingTypesError;
    }
    
    console.log('2️⃣ Setting up property_types table...');
    
    // Create property_types table
    const propertyTypesSQL = `
      CREATE TABLE IF NOT EXISTS public.property_types (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
      
      -- Enable RLS
      ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      DROP POLICY IF EXISTS "Anyone can view property types" ON public.property_types;
      CREATE POLICY "Anyone can view property types" ON public.property_types
        FOR SELECT USING (true);
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS property_types_category_id_idx ON public.property_types(category_id);
    `;
    
    const { error: propertyTypesError } = await supabase.rpc('exec_sql', { sql: propertyTypesSQL });
    if (propertyTypesError) {
      console.error('❌ Error creating property_types:', propertyTypesError);
      throw propertyTypesError;
    }
    
    console.log('3️⃣ Setting up marketplace_listings table...');
    
    // Create marketplace_listings table
    const marketplaceListingsSQL = `
      CREATE TABLE IF NOT EXISTS public.marketplace_listings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        
        -- Basic Property Information
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        
        -- Property Type and Category
        listing_type_id UUID REFERENCES public.listing_types(id) ON DELETE RESTRICT NOT NULL,
        property_type_id UUID REFERENCES public.property_types(id) ON DELETE RESTRICT NOT NULL,
        category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
        
        -- Pricing Information
        price NUMERIC(12,2) NOT NULL,
        currency TEXT DEFAULT 'NGN',
        price_period TEXT,
        security_deposit NUMERIC(12,2),
        
        -- Property Details
        bedrooms INTEGER,
        bathrooms INTEGER,
        area_sqft INTEGER,
        area_sqm INTEGER,
        year_of_construction INTEGER,
        furnishing_status TEXT,
        parking_spaces INTEGER DEFAULT 0,
        
        -- Availability
        available_from DATE,
        available_to DATE,
        
        -- Features and Amenities
        amenities JSONB DEFAULT '[]'::jsonb,
        utilities_included BOOLEAN DEFAULT false,
        
        -- Listing Management
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        views_count INTEGER DEFAULT 0,
        
        -- Contact Information
        contact_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        contact_whatsapp TEXT,
        
        -- User who created the listing
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        
        -- SEO and Additional Info
        keywords TEXT[],
        virtual_tour_url TEXT,
        video_url TEXT,
        
        -- Additional detailed fields from form
        property_condition TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'Nigeria',
        
        -- Residential specific fields
        toilets INTEGER,
        kitchen_size TEXT,
        dining_room BOOLEAN,
        balcony_terrace BOOLEAN,
        pet_friendly BOOLEAN,
        appliances_included TEXT[],
        security_features TEXT[],
        neighbourhood_features TEXT[],
        
        -- Commercial specific fields
        property_usage_type TEXT,
        total_floors INTEGER,
        floor_number INTEGER,
        office_rooms INTEGER,
        conference_rooms INTEGER,
        internet_available BOOLEAN,
        power_supply TEXT,
        loading_dock BOOLEAN,
        storage_space TEXT,
        accessibility_features TEXT[],
        fire_safety_features TEXT[],
        
        -- Land specific fields
        land_type TEXT,
        title_document TEXT,
        topography TEXT,
        water_access BOOLEAN,
        electricity_access BOOLEAN,
        fence_boundary_status TEXT,
        road_access BOOLEAN,
        soil_type TEXT,
        proximity_to_amenities TEXT[],
        
        -- Function-specific fields
        payment_frequency TEXT,
        minimum_rental_period TEXT,
        lease_duration TEXT,
        renewal_terms TEXT,
        
        -- Booking-specific fields
        daily_rate NUMERIC(12,2),
        weekly_rate NUMERIC(12,2),
        hourly_rate NUMERIC(12,2),
        check_in_time TEXT,
        check_out_time TEXT,
        minimum_stay_duration INTEGER,
        maximum_stay_duration INTEGER,
        minimum_booking_duration INTEGER,
        maximum_booking_duration INTEGER,
        cancellation_policy TEXT,
        caution_fee NUMERIC(12,2),
        services_included TEXT[],
        
        -- Additional fields
        property_size TEXT,
        monthly_rent_amount NUMERIC(12,2),
        parking_capacity INTEGER,
        lease_amount NUMERIC(12,2),
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;
    
    const { error: marketplaceError } = await supabase.rpc('exec_sql', { sql: marketplaceListingsSQL });
    if (marketplaceError) {
      console.error('❌ Error creating marketplace_listings:', marketplaceError);
      throw marketplaceError;
    }
    
    console.log('4️⃣ Setting up RLS policies and indexes...');
    
    const policiesSQL = `
      -- Enable RLS
      ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS Policies
      DROP POLICY IF EXISTS "Anyone can view active marketplace listings" ON public.marketplace_listings;
      CREATE POLICY "Anyone can view active marketplace listings" ON public.marketplace_listings
        FOR SELECT USING (is_active = true);
      
      DROP POLICY IF EXISTS "Users can create marketplace listings" ON public.marketplace_listings;
      CREATE POLICY "Users can create marketplace listings" ON public.marketplace_listings
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can update their marketplace listings" ON public.marketplace_listings;
      CREATE POLICY "Users can update their marketplace listings" ON public.marketplace_listings
        FOR UPDATE USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can delete their marketplace listings" ON public.marketplace_listings;
      CREATE POLICY "Users can delete their marketplace listings" ON public.marketplace_listings
        FOR DELETE USING (auth.uid() = user_id);
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS marketplace_listings_category_id_idx ON public.marketplace_listings(category_id);
      CREATE INDEX IF NOT EXISTS marketplace_listings_listing_type_id_idx ON public.marketplace_listings(listing_type_id);
      CREATE INDEX IF NOT EXISTS marketplace_listings_property_type_id_idx ON public.marketplace_listings(property_type_id);
      CREATE INDEX IF NOT EXISTS marketplace_listings_price_idx ON public.marketplace_listings(price);
      CREATE INDEX IF NOT EXISTS marketplace_listings_location_idx ON public.marketplace_listings USING gin(to_tsvector('english', location));
      CREATE INDEX IF NOT EXISTS marketplace_listings_title_idx ON public.marketplace_listings USING gin(to_tsvector('english', title));
      CREATE INDEX IF NOT EXISTS marketplace_listings_is_active_idx ON public.marketplace_listings(is_active);
      CREATE INDEX IF NOT EXISTS marketplace_listings_is_featured_idx ON public.marketplace_listings(is_featured);
      CREATE INDEX IF NOT EXISTS marketplace_listings_created_at_idx ON public.marketplace_listings(created_at);
      CREATE INDEX IF NOT EXISTS marketplace_listings_bedrooms_idx ON public.marketplace_listings(bedrooms);
      CREATE INDEX IF NOT EXISTS marketplace_listings_bathrooms_idx ON public.marketplace_listings(bathrooms);
      CREATE INDEX IF NOT EXISTS marketplace_listings_user_id_idx ON public.marketplace_listings(user_id);
    `;
    
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    if (policiesError) {
      console.error('❌ Error creating policies:', policiesError);
      throw policiesError;
    }
    
    console.log('5️⃣ Setting up marketplace_images table...');
    
    const marketplaceImagesSQL = `
      CREATE TABLE IF NOT EXISTS public.marketplace_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
      
      -- Enable RLS
      ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      DROP POLICY IF EXISTS "Anyone can view marketplace images" ON public.marketplace_images;
      CREATE POLICY "Anyone can view marketplace images" ON public.marketplace_images
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.marketplace_listings 
            WHERE id = marketplace_listing_id AND is_active = true
          )
        );
      
      DROP POLICY IF EXISTS "Listing owners can manage their images" ON public.marketplace_images;
      CREATE POLICY "Listing owners can manage their images" ON public.marketplace_images
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.marketplace_listings 
            WHERE id = marketplace_listing_id AND user_id = auth.uid()
          )
        );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS marketplace_images_listing_id_idx ON public.marketplace_images(marketplace_listing_id);
      CREATE INDEX IF NOT EXISTS marketplace_images_is_primary_idx ON public.marketplace_images(is_primary);
      CREATE INDEX IF NOT EXISTS marketplace_images_display_order_idx ON public.marketplace_images(display_order);
    `;
    
    const { error: imagesError } = await supabase.rpc('exec_sql', { sql: marketplaceImagesSQL });
    if (imagesError) {
      console.error('❌ Error creating marketplace_images:', imagesError);
      throw imagesError;
    }
    
    console.log('6️⃣ Inserting sample property types...');
    
    // Get categories first to insert property types
    const { data: categories } = await supabase.from('categories').select('id, name');
    
    if (categories && categories.length > 0) {
      const propertyTypeInserts = [];
      
      categories.forEach(category => {
        if (category.name === 'Residential') {
          ['Apartment', 'House', 'Villa', 'Duplex', 'Bungalow', 'Studio', 'Room', 'Shared Apartment', 'Penthouse', 'Mansion'].forEach(type => {
            propertyTypeInserts.push({ category_id: category.id, name: type });
          });
        } else if (category.name === 'Commercial') {
          ['Office Space', 'Retail Shop', 'Restaurant', 'Warehouse', 'Shopping Mall', 'Hotel', 'Event Center', 'Coworking Space', 'Medical Center', 'Showroom'].forEach(type => {
            propertyTypeInserts.push({ category_id: category.id, name: type });
          });
        } else if (category.name === 'Land') {
          ['Residential Land', 'Commercial Land', 'Agricultural Land', 'Industrial Land', 'Mixed-Use Land', 'Beachfront Land', 'Waterfront Land'].forEach(type => {
            propertyTypeInserts.push({ category_id: category.id, name: type });
          });
        } else if (category.name === 'Industrial') {
          ['Factory', 'Manufacturing Plant', 'Storage Facility', 'Distribution Center', 'Cold Storage'].forEach(type => {
            propertyTypeInserts.push({ category_id: category.id, name: type });
          });
        } else if (category.name === 'Mixed-Use') {
          ['Residential-Commercial', 'Office-Retail', 'Hotel-Residential'].forEach(type => {
            propertyTypeInserts.push({ category_id: category.id, name: type });
          });
        }
      });
      
      // Insert property types in batches
      if (propertyTypeInserts.length > 0) {
        const { error: insertError } = await supabase.from('property_types').upsert(propertyTypeInserts, {
          onConflict: 'category_id,name',
          ignoreDuplicates: true
        });
        if (insertError) {
          console.warn('⚠️ Some property types may already exist:', insertError.message);
        } else {
          console.log('✅ Property types inserted successfully');
        }
      }
    }
    
    console.log('✅ Marketplace database setup completed successfully!');
    console.log('🎉 You can now create marketplace listings');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL if RPC is not available
async function setupWithDirectSQL() {
  console.log('📝 Attempting alternative setup method...');
  
  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase.from('categories').select('*').limit(1);
    
    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    
    console.log('✅ Database connection successful');
    
    // Check if tables already exist by querying them
    const { error: listingTypesCheck } = await supabase.from('listing_types').select('count').limit(1);
    const { error: marketplaceCheck } = await supabase.from('marketplace_listings').select('count').limit(1);
    
    if (!listingTypesCheck && !marketplaceCheck) {
      console.log('✅ Marketplace tables already exist!');
      return;
    }
    
    console.log('⚠️ Marketplace tables missing. Please run the SQL schema manually.');
    console.log('📋 Run the following SQL commands in your Supabase SQL editor:');
    console.log('');
    console.log('1. First run: create_missing_tables.sql');
    console.log('2. Then run: independent_marketplace_schema.sql');
    console.log('');
    
  } catch (error) {
    console.error('💥 Alternative setup failed:', error.message);
  }
}

// Run setup
if (supabaseUrl && supabaseServiceRoleKey) {
  setupMarketplaceSchema().catch(() => {
    setupWithDirectSQL();
  });
} else {
  console.error('❌ Missing environment variables. Please check your .env file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

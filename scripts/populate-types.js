const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl, supabaseServiceKey;
for (const line of envLines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseServiceKey = line.split('=')[1].trim();
  }
}

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateTypes() {
  console.log('Populating listing_types and property_types...');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'populate_listing_types.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }

    console.log('✅ Types populated successfully!');

    // Verify the data
    const { data: listingTypes } = await supabase
      .from('listing_types')
      .select('*');

    const { data: propertyTypes } = await supabase
      .from('property_types')
      .select('*');

    console.log(`Found ${listingTypes?.length || 0} listing types`);
    console.log(`Found ${propertyTypes?.length || 0} property types`);

  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

populateTypes();
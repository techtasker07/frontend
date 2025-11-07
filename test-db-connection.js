// Test database connection and check for data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chotdmrutqiznkiwaaiy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob3RkbXJ1dHFpem5raXdhYWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjQ2ODMsImV4cCI6MjA3MTk0MDY4M30.cLmna7Ebj37LfAE3mxKntmzYprGjaF-Ahq-udtPbiJ4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Check properties table
    console.log('\n📊 Checking properties table...');
    const { data: properties, error: propError, count } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (propError) {
      console.error('❌ Properties table error:', propError);
    } else {
      console.log(`✅ Properties found: ${count} total`);
      console.log('Sample properties:', JSON.stringify(properties, null, 2));
    }
    
    // Test 2: Check marketplace_listings table
    console.log('\n🏪 Checking marketplace_listings table...');
    const { data: listings, error: listError, count: listCount } = await supabase
      .from('marketplace_listings')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (listError) {
      console.error('❌ Marketplace listings error:', listError);
    } else {
      console.log(`✅ Marketplace listings found: ${listCount} total`);
      console.log('Sample listings:', JSON.stringify(listings, null, 2));
    }
    
    // Test 3: Check profiles table
    console.log('\n👤 Checking profiles table...');
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .limit(3);
    
    if (profError) {
      console.error('❌ Profiles table error:', profError);
    } else {
      console.log(`✅ Profiles found: ${profiles.length}`);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testConnection();


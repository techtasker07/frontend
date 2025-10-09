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
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env file. Please add it.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMarketplaceImagesBucket() {
  console.log('Creating marketplace-images storage bucket...');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'marketplace-images');

    if (bucketExists) {
      console.log('✅ marketplace-images bucket already exists');
      return;
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('marketplace-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }

    console.log('✅ marketplace-images bucket created successfully');

    // Set up bucket policy for public read access
    const { error: policyError } = await supabase.storage.from('marketplace-images').createSignedUploadUrl('test');

    if (policyError) {
      console.log('Note: You may need to configure bucket policies in Supabase dashboard for proper access');
    }

  } catch (error) {
    console.error('❌ Failed to create marketplace-images bucket:', error);
  }
}

createMarketplaceImagesBucket();
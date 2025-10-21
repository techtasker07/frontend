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

async function applyReesPartyMediaPolicies() {
  console.log('Applying storage policies for rees-party-media bucket...');

  try {
    // First, ensure the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'rees-party-media');

    if (!bucketExists) {
      console.log('rees-party-media bucket does not exist. Creating it...');
      const { data: createData, error: createError } = await supabase.storage.createBucket('rees-party-media', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }

      console.log('✅ rees-party-media bucket created');
    } else {
      console.log('✅ rees-party-media bucket exists');
    }

    // Note: Storage policies need to be applied via SQL, not via the JS client
    // The policies should be in the schema file
    console.log('Note: Storage policies need to be applied via SQL. Make sure to run the rees_party_schema.sql file.');

    // Try a test upload to see if it works
    console.log('Testing upload...');
    const testFile = Buffer.from('test content');
    const fileName = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rees-party-media')
      .upload(fileName, testFile, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.log(`❌ Upload failed: ${uploadError.message}`);
      console.log('This indicates that the storage policies may not be properly configured.');
      console.log('Make sure RLS is enabled on storage.objects and the policies are applied.');
    } else {
      console.log(`✅ Upload successful: ${uploadData.path}`);

      // Clean up test file
      await supabase.storage.from('rees-party-media').remove([fileName]);
      console.log(`🗑️ Test file cleaned up`);
    }

  } catch (error) {
    console.error('❌ Failed to apply policies:', error);
  }
}

applyReesPartyMediaPolicies();
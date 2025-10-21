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

async function inspectStorageBuckets() {
  console.log('Inspecting storage buckets...');

  try {
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log('Storage buckets:');
    for (const bucket of buckets) {
      console.log(`- ${bucket.name} (id: ${bucket.id}, public: ${bucket.public})`);

      // Try to list objects in the bucket
      try {
        const { data: objects, error: objectsError } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 5 });

        if (objectsError) {
          console.log(`  Error listing objects: ${objectsError.message}`);
        } else {
          console.log(`  Objects count: ${objects.length}`);
        }
      } catch (e) {
        console.log(`  Error accessing bucket: ${e.message}`);
      }
    }

    // Check specific buckets
    const bucketsToCheck = ['property-images', 'rees-party-media'];
    for (const bucketName of bucketsToCheck) {
      console.log(`\nChecking bucket: ${bucketName}`);
      const bucketExists = buckets.some(b => b.name === bucketName);

      if (!bucketExists) {
        console.log(`❌ ${bucketName} bucket does not exist`);
        continue;
      }

      console.log(`✅ ${bucketName} bucket exists`);

      // Try to upload a test file
      try {
        const testFile = Buffer.from('test content');
        const fileName = `test-${Date.now()}.txt`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, testFile, {
            contentType: 'text/plain'
          });

        if (uploadError) {
          console.log(`❌ Upload failed: ${uploadError.message}`);
        } else {
          console.log(`✅ Upload successful: ${uploadData.path}`);

          // Clean up test file
          await supabase.storage.from(bucketName).remove([fileName]);
          console.log(`🗑️ Test file cleaned up`);
        }
      } catch (e) {
        console.log(`❌ Upload error: ${e.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Inspection failed:', error);
  }
}

inspectStorageBuckets();
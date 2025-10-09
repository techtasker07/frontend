#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file manually
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
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

console.log('🚀 Applying fresh marketplace schema...');
console.log('📊 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyFreshSchema() {
  try {
    console.log('1️⃣ Reading schema files...');

    const dropSchemaPath = path.join(__dirname, '..', 'drop_marketplace_tables.sql');
    const freshSchemaPath = path.join(__dirname, '..', 'fresh_marketplace_schema.sql');

    const dropSQL = fs.readFileSync(dropSchemaPath, 'utf8');
    const freshSQL = fs.readFileSync(freshSchemaPath, 'utf8');

    console.log('2️⃣ Dropping existing marketplace tables...');

    // Split drop SQL into individual statements and execute them
    const dropStatements = dropSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of dropStatements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.warn('⚠️ Drop statement failed (might not exist):', error.message);
          }
        } catch (err) {
          console.warn('⚠️ Drop statement failed (might not exist):', err.message);
        }
      }
    }

    console.log('3️⃣ Applying fresh marketplace schema...');

    // Split fresh SQL into individual statements and execute them
    const freshStatements = freshSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of freshStatements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          console.error('❌ Error executing statement:', error);
          console.error('Statement:', statement);
          throw error;
        }
      }
    }

    console.log('✅ Fresh marketplace schema applied successfully!');
    console.log('🎉 You can now test the marketplace property creation');

  } catch (error) {
    console.error('💥 Schema application failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function applyWithDirectSQL() {
  console.log('📝 Attempting alternative schema application...');

  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase.from('categories').select('*').limit(1);

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log('✅ Database connection successful');

    // Read and execute the schemas directly
    const dropSchemaPath = path.join(__dirname, '..', 'drop_marketplace_tables.sql');
    const freshSchemaPath = path.join(__dirname, '..', 'fresh_marketplace_schema.sql');

    const dropSQL = fs.readFileSync(dropSchemaPath, 'utf8');
    const freshSQL = fs.readFileSync(freshSchemaPath, 'utf8');

    console.log('⚠️ Direct SQL execution not available. Please run the SQL files manually in Supabase dashboard.');
    console.log('📋 Copy and paste the following SQL in order:');
    console.log('');
    console.log('1. DROP SCHEMA (drop_marketplace_tables.sql):');
    console.log(dropSQL);
    console.log('');
    console.log('2. FRESH SCHEMA (fresh_marketplace_schema.sql):');
    console.log(freshSQL);

  } catch (error) {
    console.error('💥 Alternative application failed:', error.message);
  }
}

// Run the schema application
if (supabaseUrl && supabaseServiceRoleKey) {
  applyFreshSchema().catch(() => {
    applyWithDirectSQL();
  });
} else {
  console.error('❌ Missing environment variables. Please check your .env file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
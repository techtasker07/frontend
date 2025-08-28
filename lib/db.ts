// Supabase database client for server-side operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
}

if (!supabaseServiceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not configured. Using anon key for server operations.');
}

// Create Supabase client for server-side operations
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Legacy query function for backward compatibility (will be removed after migration)
export const query = async <T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> => {
  console.warn('Legacy query function is deprecated. Please use Supabase client directly.');
  throw new Error('Direct SQL queries are not supported with Supabase. Please use the Supabase client methods.');
};

// Connection test function
export const connectDB = async () => {
  try {
    const { data, error } = await supabaseServer.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
      throw error;
    }
    console.log('Supabase connected successfully');
  } catch (err: any) {
    console.error('Supabase connection error:', err.message);
    throw new Error(`Database connection failed: ${err.message}`);
  }
};

// Test connection on import
connectDB().catch(console.error);

// This file will handle your PostgreSQL database connection for Next.js Route Handlers.
// It uses the 'pg' package directly, which is suitable for serverless functions.
import { Pool, QueryResult, QueryResultRow } from 'pg';

// Vercel Postgres connection - prioritize Vercel-specific env vars
const connectionString =
  process.env.POSTGRES_URL ||           // Vercel Postgres primary URL
  process.env.POSTGRES_URL_NON_POOLING || // Vercel Postgres non-pooling URL
  process.env.DB_EXTERNAL_URL ||        // Custom external URL
  (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : null);

if (!connectionString) {
  console.error('Database connection string is not configured. Please set POSTGRES_URL, POSTGRES_URL_NON_POOLING, DB_EXTERNAL_URL or individual DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME environment variables.');
  // In a production environment, you might want to throw an error or exit.
  // For development, we'll allow it to proceed but log the issue.
}

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false, // Required for cloud databases
  } : false,
  // Vercel/Serverless optimized settings
  max: 1, // Single connection for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Vercel Postgres specific settings
  allowExitOnIdle: true, // Allow process to exit when idle
});

// A simple wrapper function for executing queries
export const query = async <T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  try {
    // Check if we have a connection string
    if (!connectionString) {
      console.error('No database connection string available');
      throw new Error('Database not configured');
    }

    const res = await pool.query<T>(text, params);
    return res;
  } catch (err: any) {
    console.error('Database query error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      query: text,
      params: params,
      connectionString: connectionString ? 'Present' : 'Missing'
    });

    // Provide more specific error messages
    if (err.code === 'ECONNREFUSED') {
      throw new Error('Database connection refused - check database server');
    } else if (err.code === 'ENOTFOUND') {
      throw new Error('Database host not found - check connection string');
    } else if (err.code === '28P01') {
      throw new Error('Database authentication failed - check credentials');
    } else if (err.code === '3D000') {
      throw new Error('Database does not exist');
    } else {
      throw new Error(`Database operation failed: ${err.message}`);
    }
  }
};

// Call connectDB once when the module is loaded (e.g., when the first route handler is warmed up)
// This is typical for serverless environments where modules might persist.
export const connectDB = async () => {
  try {
    if (!connectionString) {
      console.error('Cannot connect to database: No connection string configured');
      return;
    }

    await pool.query('SELECT 1');
    console.log('PostgreSQL connected successfully');
  } catch (err: any) {
    console.error('PostgreSQL connection error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      connectionString: connectionString ? 'Present' : 'Missing',
      env: {
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Present' : 'Missing',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Present' : 'Missing',
        POSTGRES_USER: process.env.POSTGRES_USER ? 'Present' : 'Missing',
        POSTGRES_HOST: process.env.POSTGRES_HOST ? 'Present' : 'Missing',
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? 'Present' : 'Missing',
        POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? 'Present' : 'Missing',
        DB_EXTERNAL_URL: process.env.DB_EXTERNAL_URL ? 'Present' : 'Missing',
        DB_HOST: process.env.DB_HOST ? 'Present' : 'Missing',
        DB_USER: process.env.DB_USER ? 'Present' : 'Missing',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'Present' : 'Missing',
        DB_NAME: process.env.DB_NAME ? 'Present' : 'Missing',
        DB_PORT: process.env.DB_PORT ? 'Present' : 'Missing',
      }
    });
    // In a real application, you might want more robust error handling or retries.
  }
};

// Call connectDB once when the module is loaded (e.g., when the first route handler is warmed up)
// This is typical for serverless environments where modules might persist.
connectDB();

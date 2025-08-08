// This file will handle your PostgreSQL database connection for Next.js Route Handlers.
// It uses the 'pg' package directly, which is suitable for serverless functions.
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { NextResponse } from 'next/server';

// Use DB_EXTERNAL_URL if available, otherwise construct from individual parts
const connectionString = process.env.DB_EXTERNAL_URL ||
  (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : null);

if (!connectionString) {
  console.error('Database connection string is not configured. Please set DB_EXTERNAL_URL or individual DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME environment variables.');
  // In a production environment, you might want to throw an error or exit.
  // For development, we'll allow it to proceed but log the issue.
}

const pool = new Pool({
  connectionString: connectionString || undefined, // Use undefined if connectionString is null
  ssl: {
    rejectUnauthorized: false, // Required for Render's managed PostgreSQL or other cloud DBs
  },
});

// A simple wrapper function for executing queries
export const query = async <T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (err: any) {
    console.error('Database query error:', err.message);
    throw new Error('Database operation failed');
  }
};

// You can optionally add a connection test for logging
export const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected...');
  } catch (err: any) {
    console.error('PostgreSQL connection error:', err.message);
    // In a real application, you might want more robust error handling or retries.
  }
};

// Call connectDB once when the module is loaded (e.g., when the first route handler is warmed up)
// This is typical for serverless environments where modules might persist.
connectDB();
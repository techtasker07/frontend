import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// @route   GET /api/health
// @desc    Health check endpoint to test database connectivity
// @access  Public
export async function GET(req: NextRequest) {
  const checks = {
    database: 'unknown',
    tables: {} as Record<string, string>,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      // Vercel Postgres environment variables
      POSTGRES_URL: process.env.POSTGRES_URL ? 'Present' : 'Missing',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'Present' : 'Missing',
      POSTGRES_USER: process.env.POSTGRES_USER ? 'Present' : 'Missing',
      POSTGRES_HOST: process.env.POSTGRES_HOST ? 'Present' : 'Missing',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? 'Present' : 'Missing',
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? 'Present' : 'Missing',
      // Legacy/Custom environment variables
      DB_EXTERNAL_URL: process.env.DB_EXTERNAL_URL ? 'Present' : 'Missing',
      DB_HOST: process.env.DB_HOST ? 'Present' : 'Missing',
      DB_USER: process.env.DB_USER ? 'Present' : 'Missing',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'Present' : 'Missing',
      DB_NAME: process.env.DB_NAME ? 'Present' : 'Missing',
      DB_PORT: process.env.DB_PORT ? 'Present' : 'Missing',
    }
  };

  try {
    // Test basic database connection
    const result = await query('SELECT 1 as test, NOW() as timestamp');
    checks.database = 'connected';

    // Test table existence
    const tables = ['users', 'categories', 'properties', 'prospect_properties', 'property_prospects'];

    for (const table of tables) {
      try {
        await query(`SELECT 1 FROM ${table} LIMIT 1`);
        checks.tables[table] = 'exists';
      } catch (tableError: any) {
        checks.tables[table] = `error: ${tableError.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Health check completed',
      data: {
        ...checks,
        timestamp: result.rows[0]?.timestamp,
        test: result.rows[0]?.test
      }
    });
  } catch (error: any) {
    console.error('Health check failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });

    checks.database = `error: ${error.message}`;

    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      data: {
        ...checks,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

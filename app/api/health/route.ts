import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// @route   GET /api/health
// @desc    Health check endpoint to test database connectivity
// @access  Public
export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const result = await query('SELECT 1 as test, NOW() as timestamp');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection healthy',
      data: {
        database: 'connected',
        timestamp: result.rows[0]?.timestamp,
        test: result.rows[0]?.test
      }
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message,
      data: {
        database: 'disconnected',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

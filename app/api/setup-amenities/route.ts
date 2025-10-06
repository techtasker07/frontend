import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'create_amenities_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'SQL for amenities table creation',
      sql: sqlContent,
      instructions: 'Copy and paste this SQL into your Supabase SQL Editor to create the amenities table and populate it with sample data.'
    });
  } catch (error) {
    console.error('Error reading SQL file:', error);
    return NextResponse.json(
      { error: 'Failed to read SQL file' },
      { status: 500 }
    );
  }
}
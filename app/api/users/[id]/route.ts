// Handles GET and PUT for specific users
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { protect, AuthNextRequest } from '@/lib/authUtils';
import { User } from '@/lib/api';

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (for profile viewing)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const result = await query<User>('SELECT id, first_name, last_name, email, phone_number, firebase_uid, profile_picture, created_at, updated_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (user can only update their own profile)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await protect(req as AuthNextRequest);
  if (authResponse instanceof NextResponse) {
    return authResponse;
  }

  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
  }

  const { first_name, last_name, email, phone_number, profile_picture } = await req.json();
  const requestUserId = (req as AuthNextRequest).user!.id;

  if (userId !== requestUserId) {
    return NextResponse.json({ success: false, error: 'Not authorized to update this user' }, { status: 403 });
  }

  try {
    const result = await query<User>(
      `UPDATE users
       SET first_name = $1, last_name = $2, email = $3, phone_number = $4, profile_picture = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING id, first_name, last_name, email, phone_number, firebase_uid, profile_picture, created_at, updated_at`,
      [first_name, last_name, email, phone_number, profile_picture, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

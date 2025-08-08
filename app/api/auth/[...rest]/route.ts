// This handler combines login, register, and /me routes for authentication.
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateToken, protect, hashPassword, comparePassword, AuthNextRequest } from '@/lib/authUtils';

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
async function registerUser(req: NextRequest) {
  const { first_name, last_name, email, password, phone_number } = await req.json();

  if (!first_name || !last_name || !email || !password) {
    return NextResponse.json({ success: false, error: 'Please enter all required fields' }, { status: 400 });
  }

  try {
    const userExists = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      'INSERT INTO users (first_name, last_name, email, password_hash, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, phone_number, created_at, updated_at',
      [first_name, last_name, email, hashedPassword, phone_number]
    );

    const user = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        token: generateToken(user.id),
      },
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
async function loginUser(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Please enter all fields' }, { status: 400 });
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && (await comparePassword(password, user.password_hash))) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
          token: generateToken(user.id),
        },
      });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
async function getMe(req: AuthNextRequest) {
  const authResponse = await protect(req);
  if (authResponse instanceof NextResponse) {
    return authResponse; // Return early if protect middleware returned an error
  }
  return NextResponse.json({ success: true, data: { user: req.user } });
}

export async function POST(req: NextRequest, { params }: { params: { rest: string[] } }) {
  const action = params.rest[0];
  switch (action) {
    case 'register':
      return registerUser(req);
    case 'login':
      return loginUser(req);
    default:
      return NextResponse.json({ success: false, error: 'Invalid auth endpoint' }, { status: 404 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { rest: string[] } }) {
  const action = params.rest[0];
  switch (action) {
    case 'me':
      return getMe(req as AuthNextRequest);
    default:
      return NextResponse.json({ success: false, error: 'Invalid auth endpoint' }, { status: 404 });
  }
}

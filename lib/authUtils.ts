// This file contains server-side authentication utilities for Next.js Route Handlers.
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { User } from './api'; // Assuming User interface is imported from your API types

// Extend NextRequest to include a user property
export interface AuthNextRequest extends NextRequest {
  user?: User;
}

// Generate JWT
export const generateToken = (id: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Middleware-like function to protect routes
export const protect = async (req: AuthNextRequest): Promise<NextResponse | void> => {
  let token;

  if (req.headers.get('authorization')?.startsWith('Bearer')) {
    try {
      token = req.headers.get('authorization')?.split(' ')[1];
      if (!token) {
        return NextResponse.json({ success: false, error: 'Not authorized, no token' }, { status: 401 });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number };

      const result = await query<User>('SELECT id, first_name, last_name, email, phone_number, firebase_uid, profile_picture, created_at, updated_at FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Not authorized, user not found' }, { status: 401 });
      }
      req.user = result.rows[0];
      // If successful, don't return a response, allow the handler to continue
      return;
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json({ success: false, error: 'Not authorized, token failed' }, { status: 401 });
    }
  }

  // If no token, or malformed, respond with 401
  return NextResponse.json({ success: false, error: 'Not authorized, no token' }, { status: 401 });
};

// Hashes password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compares password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

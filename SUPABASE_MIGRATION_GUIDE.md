# Supabase Migration Guide

## Overview
Your app has been successfully migrated from a custom PostgreSQL + JWT implementation to Supabase. This guide covers what was changed and the next steps for deployment.

## Changes Made

### 1. Dependencies Updated
- ✅ Added `@supabase/supabase-js` for Supabase client
- ✅ Removed dependencies on `pg`, `jsonwebtoken`, `bcryptjs` (moved to dev dependencies)

### 2. Environment Variables Updated
**Updated in `.env`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://chotdmrutqiznkiwaaiy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob3RkbXJ1dHFpem5raXdhYWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjQ2ODMsImV4cCI6MjA3MTk0MDY4M30.cLmna7Ebj37LfAE3mxKntmzYprGjaF-Ahq-udtPbiJ4
```

**Required for Vercel Deployment:**
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Files Modified

#### Core Infrastructure
- `lib/supabase.ts` - New Supabase client configuration
- `lib/db.ts` - Replaced PostgreSQL with Supabase server client
- `lib/auth.tsx` - Migrated from JWT to Supabase Auth
- `lib/api.ts` - Now exports Supabase API client
- `lib/supabase-api.ts` - New Supabase-based API client

#### Key Changes in Auth
- **Before**: Custom JWT tokens stored in localStorage
- **After**: Supabase Auth with automatic session management
- **Benefits**: 
  - Built-in email verification
  - Password reset functionality
  - Social login support (can be added later)
  - Automatic token refresh

#### Database Changes
- **Before**: Direct PostgreSQL queries with `pg` library
- **After**: Supabase client with Row Level Security
- **Benefits**:
  - Built-in security policies
  - Real-time subscriptions (can be added)
  - Automatic API generation
  - Built-in file storage

### 4. Database Schema
The complete database schema is in `supabase_schema.sql`. This includes:

#### Tables Created:
- `profiles` - User profiles (extends auth.users)
- `categories` - Property categories
- `vote_options` - Voting options for each category
- `properties` - User-submitted properties
- `property_images` - Property photos
- `votes` - User votes on properties
- `prospect_properties` - AI-generated prospect properties
- `property_prospects` - Investment ideas for prospects

#### Security Features:
- Row Level Security (RLS) enabled on all tables
- Policies for proper access control
- Automatic profile creation on user signup
- Secure file upload to Supabase Storage

#### Sample Data:
- 4 property categories (Residential, Commercial, Land, Industrial)
- Vote options for each category
- Storage bucket for property images

## Deployment Steps

### 1. Set up Supabase Database
1. Go to your Supabase project: https://supabase.com/dashboard/project/chotdmrutqiznkiwaaiy
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `supabase_schema.sql`
4. Execute the SQL script
5. Verify all tables are created in the Table Editor

### 2. Configure Supabase Storage
1. In Supabase Dashboard, go to Storage
2. Verify the `property-images` bucket was created
3. Make sure it's set to public access

### 3. Update Vercel Environment Variables
Add these to your Vercel project environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://chotdmrutqiznkiwaaiy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob3RkbXJ1dHFpem5raXdhYWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjQ2ODMsImV4cCI6MjA3MTk0MDY4M30.cLmna7Ebj37LfAE3mxKntmzYprGjaF-Ahq-udtPbiJ4
SUPABASE_SERVICE_ROLE_KEY=[Get this from Supabase Dashboard → Settings → API]
```

### 4. Get Service Role Key
1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (not the anon key)
3. Add it to Vercel environment variables as `SUPABASE_SERVICE_ROLE_KEY`

### 5. Deploy and Test
1. Deploy your updated code to Vercel
2. Test user registration and login
3. Test property creation and voting
4. Test image uploads

## Authentication Changes

### User Registration Flow
**Before:**
```typescript
// Custom registration with JWT
const response = await api.register(userData);
// Manual token management
localStorage.setItem('token', response.data.token);
```

**After:**
```typescript
// Supabase Auth with automatic session management
const { data, error } = await supabase.auth.signUp({
  email: userData.email,
  password: userData.password
});
// Profile automatically created via database trigger
```

### Login Flow
**Before:**
```typescript
// Custom login with manual token handling
const response = await api.login(credentials);
localStorage.setItem('token', response.data.token);
```

**After:**
```typescript
// Supabase Auth with automatic session management
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
// Session automatically managed by Supabase
```

## Data Migration (If Needed)

If you have existing data in your current database that needs to be migrated:

1. **Export existing data** from your current PostgreSQL database
2. **Transform data format** to match new UUID-based schema
3. **Import data** using Supabase SQL Editor or client libraries
4. **Update foreign key relationships** to use UUIDs instead of integers

## Rollback Plan

If you need to rollback:
1. The old API routes are still present (though they won't work without the old database)
2. Old dependencies are still in package.json as dev dependencies
3. You can restore the old `.env` variables
4. Revert the changes to `lib/auth.tsx`, `lib/db.ts`, and `lib/api.ts`

## Benefits of the Migration

### Security
- Built-in Row Level Security
- No need to manage JWT secrets
- Automatic session management
- Built-in protection against common vulnerabilities

### Development Speed
- No need to write auth endpoints
- Automatic API generation
- Built-in file storage
- Real-time capabilities (can be added later)

### Scalability
- Managed infrastructure
- Automatic scaling
- Built-in CDN for file storage
- Global edge functions support

### Maintenance
- No server maintenance required
- Automatic security updates
- Built-in monitoring and analytics
- Easy backup and restore

## Next Steps After Deployment

1. **Test thoroughly** - Ensure all features work as expected
2. **Set up monitoring** - Use Supabase Dashboard to monitor usage
3. **Configure email templates** - Customize auth emails in Supabase Dashboard
4. **Add social login** (optional) - Google, GitHub, etc.
5. **Set up real-time features** (optional) - Live voting updates
6. **Optimize RLS policies** - Review and refine security policies
7. **Set up analytics** - Use Supabase Analytics or integrate with third-party tools

## Support

If you encounter any issues:
1. Check Supabase logs in the Dashboard
2. Verify environment variables are set correctly
3. Ensure database schema was applied successfully
4. Check that all RLS policies are working as expected

The migration maintains backward compatibility with your existing React components and hooks, so your frontend code should continue to work with minimal changes.

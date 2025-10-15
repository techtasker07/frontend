import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const context = requestUrl.searchParams.get('context') || 'login'

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
        },
      }
    )

    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Error exchanging code for session:', sessionError)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
    }

    if (session?.user) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      // If profile doesn't exist, create it from Google user data
      if (profileError || !profile) {
        const userMetadata = session.user.user_metadata
        const email = session.user.email || ''

        // Extract first and last name from Google user metadata
        let firstName = userMetadata?.given_name || userMetadata?.first_name || ''
        let lastName = userMetadata?.family_name || userMetadata?.last_name || ''

        // If we don't have first/last name, try to parse from full_name or name
        if (!firstName && !lastName) {
          const fullName = userMetadata?.full_name || userMetadata?.name || ''
          if (fullName) {
            const nameParts = fullName.trim().split(' ')
            firstName = nameParts[0] || ''
            lastName = nameParts.slice(1).join(' ') || ''
          }
        }

        // If still no first name, use email username
        if (!firstName) {
          firstName = email.split('@')[0] || 'User'
        }

        // Ensure last name is not empty
        if (!lastName) {
          lastName = ''
        }

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            profile_picture: userMetadata?.avatar_url || userMetadata?.picture || null,
          })

        if (insertError && !insertError.message.includes('duplicate key')) {
          console.error('Error creating profile:', insertError)
        }
      }

      // Handle redirection based on context and profile existence
      if (context === 'login' && (profileError || !profile)) {
        // User tried to login but profile doesn't exist - redirect to register with email
        return NextResponse.redirect(`${requestUrl.origin}/register?email=${encodeURIComponent(session.user.email || '')}`)
      }
    }
  }

  // Redirect to welcome-back page after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/ai/welcome-back`)
}

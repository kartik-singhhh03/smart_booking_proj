import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth error redirects
  if (errorParam) {
    console.error('OAuth error:', errorParam, errorDescription);
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', errorParam);
    if (errorDescription) {
      loginUrl.searchParams.set('error_description', errorDescription);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Exchange the authorization code for a session
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.redirect(new URL('/login?error=config_error', origin));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
    }
  }

  // Redirect to home page on success
  return NextResponse.redirect(new URL('/', origin));
}

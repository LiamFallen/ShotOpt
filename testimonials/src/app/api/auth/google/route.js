import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { googleConfigured } from '@/lib/auth';
import { appUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Step 1 of the OAuth flow: send the user to Google's consent screen.
export async function GET() {
  if (!googleConfigured()) {
    return new NextResponse(
      'Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET — see README.',
      { status: 503 }
    );
  }
  const state = crypto.randomBytes(16).toString('hex');
  const jar = await cookies();
  jar.set('lw_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${appUrl()}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

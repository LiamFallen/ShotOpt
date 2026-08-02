import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail, getUserByGoogleId, createUser, run } from '@/lib/db';
import { googleConfigured, startSession } from '@/lib/auth';
import { appUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Step 2: Google redirects back here with a one-time code.
export async function GET(request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(`${appUrl()}/login`);
  }
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const jar = await cookies();
  const expectedState = jar.get('lw_oauth_state')?.value;
  jar.delete('lw_oauth_state');
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${appUrl()}/login`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${appUrl()}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error('token exchange failed');
    const tokens = await tokenRes.json();

    // The id_token arrives directly from Google over TLS in the same
    // exchange, so decoding its payload without re-verifying the signature
    // is safe here.
    const payload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString('utf8')
    );
    const googleId = String(payload.sub);
    const email = String(payload.email || '').toLowerCase();
    const name = String(payload.name || '');
    if (!email || !payload.email_verified) throw new Error('no verified email');

    let user = await getUserByGoogleId(googleId);
    if (!user) {
      const existing = await getUserByEmail(email);
      if (existing) {
        // Same verified email → link Google to the existing account.
        await run('UPDATE users SET google_id = ? WHERE id = ?', [googleId, existing.id]);
        user = existing;
      } else {
        user = await createUser({ email, name, googleId });
      }
    }
    await startSession(user.id);
    return NextResponse.redirect(`${appUrl()}/dashboard`);
  } catch {
    return NextResponse.redirect(`${appUrl()}/login?error=google`);
  }
}

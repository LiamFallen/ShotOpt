import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'node:crypto';
import { createSession, deleteSession, getUserBySession } from './db';

export const SESSION_COOKIE = 'lw_session';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

export function verifyPassword(password, stored) {
  const [salt, key] = String(stored).split(':');
  if (!salt || !key) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export async function startSession(userId) {
  const token = await createSession(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token).catch(() => {});
  jar.delete(SESSION_COOKIE);
}

// Returns the logged-in user row, or undefined.
export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return undefined;
  return getUserBySession(token);
}

// For pages/actions that require login.
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

export function googleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

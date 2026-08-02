'use server';

import { redirect } from 'next/navigation';
import { createUser, getUserByEmail } from '@/lib/db';
import { hashPassword, verifyPassword, startSession, endSession } from '@/lib/auth';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase().slice(0, 200);
  const name = String(formData.get('name') || '').trim().slice(0, 100);
  const password = String(formData.get('password') || '');
  if (!EMAIL.test(email)) return { error: 'Please enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (await getUserByEmail(email)) {
    return { error: 'An account with that email already exists. Try logging in instead.' };
  }
  const user = await createUser({ email, name, passwordHash: hashPassword(password) });
  await startSession(user.id);
  redirect('/dashboard');
}

export async function login(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase().slice(0, 200);
  const password = String(formData.get('password') || '');
  const user = await getUserByEmail(email);
  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    if (user && !user.password_hash && user.google_id) {
      return { error: 'This account uses Google sign-in. Use the Google button below.' };
    }
    return { error: 'Wrong email or password.' };
  }
  await startSession(user.id);
  redirect('/dashboard');
}

export async function logout() {
  await endSession();
  redirect('/');
}

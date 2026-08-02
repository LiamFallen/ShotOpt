import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '../auth-form';
import { login } from '../actions';
import { currentUser, googleConfigured } from '@/lib/auth';
import { PRODUCT_NAME } from '@/lib/config';

export const metadata = { title: 'Log in', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await currentUser()) redirect('/dashboard');
  return (
    <main className="container narrow auth-page">
      <header className="page-header">
        <Link href="/" className="wordmark">
          <span className="mark">♥</span> {PRODUCT_NAME}
        </Link>
        <h1>Welcome back</h1>
        <p>Log in to manage your walls.</p>
      </header>
      <AuthForm action={login} mode="login" googleEnabled={googleConfigured()} />
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        No account yet? <Link href="/signup">Start free</Link>
      </p>
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '../auth-form';
import { signup } from '../actions';
import { currentUser, googleConfigured } from '@/lib/auth';
import { PRODUCT_NAME } from '@/lib/config';

export const metadata = { title: 'Start free', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  if (await currentUser()) redirect('/dashboard');
  return (
    <main className="container narrow auth-page">
      <header className="page-header">
        <Link href="/" className="wordmark">
          <span className="mark">♥</span> {PRODUCT_NAME}
        </Link>
        <h1>Create your free account</h1>
        <p>One wall, ten testimonials, no credit card. Upgrade whenever you outgrow it.</p>
      </header>
      <AuthForm action={signup} mode="signup" googleEnabled={googleConfigured()} />
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}

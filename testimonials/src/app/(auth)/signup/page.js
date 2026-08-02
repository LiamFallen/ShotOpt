import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '../auth-form';
import { signup } from '../actions';
import { currentUser, googleConfigured } from '@/lib/auth';
import { PRODUCT_NAME } from '@/lib/config';
import { IconHeartMark } from '@/components/icons';

export const metadata = { title: 'Start free', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  if (await currentUser()) redirect('/dashboard');
  return (
    <main className="auth-bg">
      <div className="auth-box">
        <Link href="/" className="wordmark">
          <IconHeartMark /> {PRODUCT_NAME}
        </Link>
        <h1>Create your free account</h1>
        <p className="lede">One wall, ten testimonials, no credit card.</p>
        <AuthForm action={signup} mode="signup" googleEnabled={googleConfigured()} />
        <p className="auth-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '../auth-form';
import { login } from '../actions';
import { currentUser, googleConfigured } from '@/lib/auth';
import { PRODUCT_NAME } from '@/lib/config';
import { IconHeartMark } from '@/components/icons';

export const metadata = { title: 'Sign in', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await currentUser()) redirect('/dashboard');
  return (
    <main className="auth-bg">
      <div className="auth-box">
        <Link href="/" className="wordmark">
          <IconHeartMark /> {PRODUCT_NAME}
        </Link>
        <h1>Welcome back</h1>
        <p className="lede">Sign in to manage your walls.</p>
        <AuthForm action={login} mode="login" googleEnabled={googleConfigured()} />
        <p className="auth-foot">
          No account yet? <Link href="/signup">Start free</Link>
        </p>
      </div>
    </main>
  );
}

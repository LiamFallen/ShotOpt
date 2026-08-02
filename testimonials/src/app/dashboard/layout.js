import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { PRODUCT_NAME } from '@/lib/config';
import { logout } from '../(auth)/actions';

export const metadata = { title: 'Dashboard', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  const plan = planOf(user);
  return (
    <div className="container">
      <nav className="admin-nav">
        <Link href="/dashboard" className="wordmark">
          ♥ {PRODUCT_NAME}
        </Link>
        <Link href="/dashboard">Walls</Link>
        <Link href="/dashboard/billing">Billing</Link>
        <span className={`pill${plan.key === 'free' ? ' muted' : ''}`}>{plan.name}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '0.85rem' }}>
          {user.email}
        </span>
        <form action={logout}>
          <button className="btn small secondary" type="submit">
            Log out
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}

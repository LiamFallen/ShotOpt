import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { PRODUCT_NAME } from '@/lib/config';
import { logout } from '../(auth)/actions';
import { IconHeartMark, IconWall, IconCard, IconLogout } from '@/components/icons';

export const metadata = { title: 'Dashboard', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  const plan = planOf(user);
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="wordmark">
          <IconHeartMark /> {PRODUCT_NAME}
        </Link>
        <nav>
          <Link className="side-link" href="/dashboard">
            <IconWall size={17} /> Walls
          </Link>
          <Link className="side-link" href="/dashboard/billing">
            <IconCard size={17} /> Billing
          </Link>
        </nav>
        <div className="foot">
          <div className="who">
            <div className="email">{user.email}</div>
            <div className="plan">{plan.name} plan</div>
          </div>
          <form action={logout}>
            <button className="iconbtn" type="submit" title="Sign out" aria-label="Sign out">
              <IconLogout size={16} />
            </button>
          </form>
        </div>
      </aside>
      <div className="content">{children}</div>
    </div>
  );
}

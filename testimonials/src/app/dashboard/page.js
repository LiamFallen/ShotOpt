import Link from 'next/link';
import { listWallsByUser } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import CreateWallForm from './create-wall-form';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();
  const plan = planOf(user);
  const walls = await listWallsByUser(user.id);
  const totals = walls.reduce(
    (acc, w) => ({
      total: acc.total + w.total,
      pending: acc.pending + w.pending,
      views: acc.views + w.views,
    }),
    { total: 0, pending: 0, views: 0 }
  );
  const atWallCap = walls.length >= plan.maxWalls;

  return (
    <main>
      <div className="content-head">
        <h1>Walls</h1>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="n">
            {walls.length}
            {Number.isFinite(plan.maxWalls) ? <span className="cap"> / {plan.maxWalls}</span> : null}
          </div>
          <div className="l">Walls</div>
        </div>
        <div className="stat">
          <div className="n">{totals.total}</div>
          <div className="l">Testimonials</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: totals.pending ? '#a15c00' : undefined }}>
            {totals.pending}
          </div>
          <div className="l">Pending review</div>
        </div>
        <div className="stat">
          <div className="n">{totals.views}</div>
          <div className="l">Wall views</div>
        </div>
      </div>

      {walls.length === 0 ? (
        <div className="empty">
          <strong>No walls yet</strong>
          Create your first one below — it takes ten seconds.
        </div>
      ) : (
        walls.map((w) => (
          <div className="wall-row" key={w.id}>
            <div className="grow">
              <span className="title">{w.title}</span>{' '}
              <span className="meta">/w/{w.slug}</span>
              <div className="meta">
                {w.total} testimonial{w.total === 1 ? '' : 's'} · {w.views} view
                {w.views === 1 ? '' : 's'}
              </div>
            </div>
            {w.pending > 0 ? (
              <span className="pill warn">{w.pending} pending</span>
            ) : (
              <span className="pill muted">0 pending</span>
            )}
            <Link className="btn small secondary" href={`/dashboard/w/${w.id}`}>
              Manage
            </Link>
            <a className="btn small secondary" href={`/w/${w.slug}`} target="_blank">
              View wall
            </a>
          </div>
        ))
      )}

      <h2>Create a wall</h2>
      {atWallCap ? (
        <div className="notice">
          <span>
            The {plan.name} plan includes {plan.maxWalls} wall{plan.maxWalls === 1 ? '' : 's'}.{' '}
            <Link href="/dashboard/billing">Upgrade to Pro</Link> for unlimited walls, unlimited
            testimonials and badge removal.
          </span>
        </div>
      ) : (
        <CreateWallForm />
      )}
    </main>
  );
}

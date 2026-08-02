import { adminStats, adminListUsers, adminListWalls } from '@/lib/db';
import { PRODUCT_NAME } from '@/lib/config';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Platform admin', robots: { index: false } };

// Operator-only overview (protected by basic auth in middleware).
// Customers never see this — they use /dashboard.
export default async function PlatformAdminPage() {
  const [stats, users, walls] = await Promise.all([
    adminStats(),
    adminListUsers(),
    adminListWalls(),
  ]);

  return (
    <main className="container" style={{ background: 'var(--tint)', maxWidth: 'none', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div className="content-head">
        <h1>{PRODUCT_NAME} · Platform admin</h1>
        <div className="spacer" />
        <a href="/">← Home</a>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="n">{stats.users}</div>
          <div className="l">Users</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: 'var(--ok)' }}>{stats.paying}</div>
          <div className="l">Paying</div>
        </div>
        <div className="stat">
          <div className="n">{stats.walls}</div>
          <div className="l">Walls</div>
        </div>
        <div className="stat">
          <div className="n">{stats.testimonials}</div>
          <div className="l">Testimonials</div>
        </div>
        <div className="stat">
          <div className="n">{stats.views}</div>
          <div className="l">Wall views</div>
        </div>
      </div>

      <h2>Users</h2>
      {users.length === 0 ? (
        <div className="empty">No signups yet.</div>
      ) : (
        users.map((u) => (
          <div className="wall-row" key={u.id}>
            <div className="grow">
              <strong>{u.email}</strong>
              {u.name ? <span style={{ color: 'var(--faint)' }}> — {u.name}</span> : null}
              <div style={{ color: 'var(--faint)', fontSize: '0.82rem' }}>
                {u.walls} wall{u.walls === 1 ? '' : 's'} · {u.testimonials} testimonial
                {u.testimonials === 1 ? '' : 's'} · joined {u.created_at} UTC
              </div>
            </div>
            <span className={`pill${u.plan === 'free' ? ' muted' : ''}`}>{u.plan}</span>
          </div>
        ))
      )}

      <h2 style={{ marginTop: '2.5rem' }}>Walls</h2>
      {walls.length === 0 ? (
        <div className="empty">No walls yet.</div>
      ) : (
        walls.map((w) => (
          <div className="wall-row" key={w.id}>
            <div className="grow">
              <strong>{w.title}</strong>{' '}
              <span style={{ color: 'var(--faint)', fontSize: '0.85rem' }}>/w/{w.slug}</span>
              <div style={{ color: 'var(--faint)', fontSize: '0.82rem' }}>
                {w.owner || 'no owner (legacy)'} · {w.total} testimonial{w.total === 1 ? '' : 's'} ·{' '}
                {w.views} view{w.views === 1 ? '' : 's'}
              </div>
            </div>
            <a className="btn small secondary" href={`/w/${w.slug}`} target="_blank">
              View
            </a>
          </div>
        ))
      )}
      </div>
    </main>
  );
}

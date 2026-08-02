import Link from 'next/link';
import { listWalls } from '@/lib/db';
import { createWall } from './actions';
import { PRODUCT_NAME } from '@/lib/config';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Admin', robots: { index: false } };

export default async function AdminPage() {
  const walls = await listWalls();
  const totals = walls.reduce(
    (acc, w) => ({
      total: acc.total + w.total,
      pending: acc.pending + w.pending,
      views: acc.views + w.views,
    }),
    { total: 0, pending: 0, views: 0 }
  );

  return (
    <main className="container">
      <nav className="admin-nav">
        <h1>{PRODUCT_NAME} · Admin</h1>
        <a href="/" style={{ marginLeft: 'auto' }}>
          ← Home
        </a>
      </nav>

      <div className="stats">
        <div className="stat">
          <div className="n">{walls.length}</div>
          <div className="l">Walls</div>
        </div>
        <div className="stat">
          <div className="n">{totals.total}</div>
          <div className="l">Testimonials</div>
        </div>
        <div className="stat">
          <div className="n" style={{ color: totals.pending ? 'var(--star)' : undefined }}>
            {totals.pending}
          </div>
          <div className="l">Pending review</div>
        </div>
        <div className="stat">
          <div className="n">{totals.views}</div>
          <div className="l">Wall views</div>
        </div>
      </div>

      <h2>Walls</h2>
      {walls.length === 0 ? (
        <div className="empty">No walls yet. Create your first one below.</div>
      ) : (
        walls.map((w) => (
          <div className="wall-row" key={w.id}>
            <div className="grow">
              <strong>{w.title}</strong>{' '}
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>/w/{w.slug}</span>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                {w.total} testimonial{w.total === 1 ? '' : 's'} · {w.views} view
                {w.views === 1 ? '' : 's'}
              </div>
            </div>
            {w.pending > 0 ? (
              <span className="pill">{w.pending} pending</span>
            ) : (
              <span className="pill muted">0 pending</span>
            )}
            <Link className="btn small secondary" href={`/admin/w/${w.id}`}>
              Manage
            </Link>
            <a className="btn small secondary" href={`/w/${w.slug}`} target="_blank">
              View wall
            </a>
          </div>
        ))
      )}

      <h2 style={{ marginTop: '2.5rem' }}>Create a wall</h2>
      <form className="card" action={createWall} style={{ maxWidth: 520 }}>
        <div className="field">
          <label htmlFor="w-title">Title *</label>
          <input id="w-title" name="title" type="text" required maxLength={100} placeholder="Acme Inc." />
        </div>
        <div className="field">
          <label htmlFor="w-slug">
            Slug <span className="hint">(optional — auto-generated from the title)</span>
          </label>
          <input id="w-slug" name="slug" type="text" maxLength={40} placeholder="acme" />
        </div>
        <div className="field">
          <label htmlFor="w-desc">
            Short description <span className="hint">(shown under the wall title)</span>
          </label>
          <input id="w-desc" name="description" type="text" maxLength={300} />
        </div>
        <button className="btn" type="submit">
          Create wall
        </button>
      </form>
    </main>
  );
}

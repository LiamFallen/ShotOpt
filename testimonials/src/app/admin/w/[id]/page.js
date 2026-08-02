import Link from 'next/link';
import { notFound } from 'next/navigation';
import Stars from '@/components/Stars';
import CopyLink from './copy-link';
import { getWallById, allTestimonials } from '@/lib/db';
import { avatarSrc } from '@/lib/media';
import { appUrl } from '@/lib/config';
import { updateWall, deleteWall, setApproval, deleteTestimonial } from '../../actions';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Manage wall', robots: { index: false } };

export default async function ManageWallPage({ params }) {
  const { id } = await params;
  const wall = await getWallById(Number(id));
  if (!wall) notFound();
  const items = await allTestimonials(wall.id);
  const pending = items.filter((t) => !t.approved).length;
  const base = appUrl();

  const embedSnippet = `<div data-testimonials-wall="${wall.slug}" data-theme="light"></div>\n<script src="${base}/embed.js" async></script>`;

  return (
    <main className="container">
      <nav className="admin-nav">
        <h1>{wall.title}</h1>
        <span className="pill" style={{ background: pending ? 'var(--star)' : 'var(--border)' }}>
          {pending} pending
        </span>
        <Link href="/admin" style={{ marginLeft: 'auto' }}>
          ← All walls
        </Link>
      </nav>

      <div className="stats">
        <div className="stat">
          <div className="n">{items.length}</div>
          <div className="l">Total submissions</div>
        </div>
        <div className="stat">
          <div className="n">{items.length - pending}</div>
          <div className="l">Approved</div>
        </div>
        <div className="stat">
          <div className="n">{wall.views}</div>
          <div className="l">Wall views</div>
        </div>
      </div>

      <h2>Share &amp; embed</h2>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="field">
          <label>Public wall</label>
          <CopyLink value={`${base}/w/${wall.slug}`} />
        </div>
        <div className="field">
          <label>Collect testimonials (send this to customers)</label>
          <CopyLink value={`${base}/submit/${wall.slug}`} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>
            Embed on any site <span className="hint">(set data-theme to light, dark or auto)</span>
          </label>
          <CopyLink value={embedSnippet} multiline />
        </div>
      </div>

      <h2>Settings &amp; branding</h2>
      <form className="card" action={updateWall} style={{ maxWidth: 520, marginBottom: '1.5rem' }}>
        <input type="hidden" name="id" value={wall.id} />
        <div className="field">
          <label htmlFor="s-title">Title</label>
          <input id="s-title" name="title" type="text" defaultValue={wall.title} maxLength={100} required />
        </div>
        <div className="field">
          <label htmlFor="s-desc">Short description</label>
          <input id="s-desc" name="description" type="text" defaultValue={wall.description} maxLength={300} />
        </div>
        <div className="field">
          <label htmlFor="s-accent">Accent colour</label>
          <input id="s-accent" name="accent" type="color" defaultValue={wall.accent} />
        </div>
        <div className="field">
          <label style={{ fontWeight: 400 }}>
            <input type="checkbox" name="hide_badge" defaultChecked={!!wall.hide_badge} /> Hide
            “Powered by” badge <span className="hint">(will be a paid feature)</span>
          </label>
        </div>
        <button className="btn" type="submit">
          Save settings
        </button>
      </form>

      <h2>Submissions</h2>
      {items.length === 0 ? (
        <div className="empty">
          Nothing yet. Share the collect link above to get your first testimonial.
        </div>
      ) : (
        items.map((t) => (
          <div key={t.id} className={`sub-row${t.approved ? '' : ' pending'}`}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {t.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="t-avatar" src={avatarSrc(t.avatar)} alt="" />
              ) : null}
              <div style={{ flex: 1, minWidth: 180 }}>
                <strong>{t.name}</strong>
                {t.role ? <span style={{ color: 'var(--muted)' }}> — {t.role}</span> : null}
                <div>
                  <Stars rating={t.rating} />
                </div>
              </div>
              <span className={`pill${t.approved ? '' : ' muted'}`}>
                {t.approved ? 'Live' : 'Pending'}
              </span>
            </div>
            <p className="t-text" style={{ margin: '0.6rem 0 0' }}>
              {t.text}
            </p>
            {t.video_url ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                🎬 <a href={t.video_url} target="_blank" rel="noopener noreferrer nofollow">{t.video_url}</a>
              </div>
            ) : null}
            {t.url ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                🔗 <a href={t.url} target="_blank" rel="noopener noreferrer nofollow">{t.url}</a>
              </div>
            ) : null}
            <div className="sub-actions">
              <form action={setApproval}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="approved" value={t.approved ? 0 : 1} />
                <button className={`btn small${t.approved ? ' secondary' : ''}`} type="submit">
                  {t.approved ? 'Unapprove' : 'Approve'}
                </button>
              </form>
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <button className="btn small danger" type="submit">
                  Delete
                </button>
              </form>
              <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '0.78rem' }}>
                {t.created_at} UTC
              </span>
            </div>
          </div>
        ))
      )}

      <h2 style={{ marginTop: '2.5rem' }}>Danger zone</h2>
      <form className="card" action={deleteWall} style={{ maxWidth: 520 }}>
        <input type="hidden" name="id" value={wall.id} />
        <p style={{ marginTop: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
          Deleting this wall permanently removes all {items.length} of its submissions and their
          uploaded photos.
        </p>
        <button className="btn danger" type="submit">
          Delete wall
        </button>
      </form>
    </main>
  );
}

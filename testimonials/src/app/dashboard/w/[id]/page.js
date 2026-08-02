import Link from 'next/link';
import { notFound } from 'next/navigation';
import Stars from '@/components/Stars';
import CopyLink from './copy-link';
import AddTestimonialForm from './add-form';
import StylePicker from './style-picker';
import { getWallById, allTestimonials, wallSummary } from '@/lib/db';
import { avatarSrc } from '@/lib/media';
import { requireUser } from '@/lib/auth';
import { planOf } from '@/lib/plans';
import { appUrl } from '@/lib/config';
import { IconDownload, IconPin } from '@/components/icons';
import { updateWall, deleteWall, setApproval, deleteTestimonial, togglePin } from '../../actions';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Manage wall', robots: { index: false } };

export default async function ManageWallPage({ params, searchParams }) {
  const user = await requireUser();
  const plan = planOf(user);
  const { id } = await params;
  const { f = 'all' } = await searchParams;
  const wall = await getWallById(Number(id));
  if (!wall || wall.user_id !== user.id) notFound();
  const items = await allTestimonials(wall.id);
  const summary = await wallSummary(wall.id);
  const pending = items.filter((t) => !t.approved).length;
  const live = items.length - pending;
  const shown =
    f === 'pending' ? items.filter((t) => !t.approved) : f === 'live' ? items.filter((t) => t.approved) : items;
  const base = appUrl();
  const capacity = plan.maxTestimonialsPerWall;
  const atCap = items.length >= capacity;

  const embedSnippet = `<div data-testimonials-wall="${wall.slug}"></div>\n<script src="${base}/embed.js" async></script>`;
  const carouselSnippet = `<div data-testimonials-wall="${wall.slug}" data-layout="carousel"></div>\n<script src="${base}/embed.js" async></script>`;

  return (
    <main>
      <div className="content-head">
        <h1>{wall.title}</h1>
        {pending > 0 ? <span className="pill warn">{pending} pending</span> : null}
        <div className="spacer" />
        <a className="btn small secondary" href={`/api/export/${wall.id}`}>
          <IconDownload size={14} /> Export CSV
        </a>
        <a className="btn small secondary" href={`/w/${wall.slug}`} target="_blank">
          View wall
        </a>
        <Link className="btn small ghost" href="/dashboard">
          ← All walls
        </Link>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="n">
            {items.length}
            {Number.isFinite(capacity) ? <span className="cap"> / {capacity}</span> : null}
          </div>
          <div className="l">Submissions</div>
        </div>
        <div className="stat">
          <div className="n">{live}</div>
          <div className="l">Live</div>
        </div>
        <div className="stat">
          <div className="n">{summary.avg ?? '—'}</div>
          <div className="l">Avg rating</div>
        </div>
        <div className="stat">
          <div className="n">{wall.views}</div>
          <div className="l">Wall views</div>
        </div>
      </div>

      {atCap ? (
        <div className="notice warn">
          <span>
            This wall is at the {plan.name} plan limit of {capacity} testimonials — new
            submissions are paused. <Link href="/dashboard/billing">Upgrade to Pro</Link> to keep
            collecting.
          </span>
        </div>
      ) : null}

      <h2>Share &amp; embed</h2>
      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <div className="two-col">
          <div className="field">
            <label>Public wall</label>
            <CopyLink value={`${base}/w/${wall.slug}`} />
          </div>
          <div className="field">
            <label>Collect testimonials (send this to customers)</label>
            <CopyLink value={`${base}/submit/${wall.slug}`} />
          </div>
        </div>
        <div className="two-col">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>
              Embed: wall <span className="hint">(masonry — add data-theme=&quot;dark&quot; for dark sites)</span>
            </label>
            <CopyLink value={embedSnippet} multiline />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>
              Embed: carousel <span className="hint">(auto-advancing row)</span>
            </label>
            <CopyLink value={carouselSnippet} multiline />
          </div>
        </div>
      </div>

      <h2>Testimonials</h2>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        <div className="tabs">
          <Link href={`/dashboard/w/${wall.id}`} className={f === 'all' ? 'active' : ''}>
            All {items.length}
          </Link>
          <Link href={`/dashboard/w/${wall.id}?f=pending`} className={f === 'pending' ? 'active' : ''}>
            Pending {pending}
          </Link>
          <Link href={`/dashboard/w/${wall.id}?f=live`} className={f === 'live' ? 'active' : ''}>
            Live {live}
          </Link>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <AddTestimonialForm wallId={wall.id} />
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <strong>Nothing here yet</strong>
          {f === 'all'
            ? 'Share the collect link above, or add a testimonial you already have.'
            : `No ${f} testimonials right now.`}
        </div>
      ) : (
        shown.map((t) => (
          <div key={t.id} className="sub-row">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {t.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="t-avatar" src={avatarSrc(t.avatar)} alt="" />
              ) : null}
              <div style={{ flex: 1, minWidth: 180 }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.name}</span>
                {t.role ? <span style={{ color: 'var(--faint)' }}> — {t.role}</span> : null}
                <div>
                  <Stars rating={t.rating} size={13} />
                </div>
              </div>
              {t.pinned ? (
                <span className="pill">
                  <IconPin size={11} /> Pinned
                </span>
              ) : null}
              {t.source === 'manual' ? <span className="pill muted">Imported</span> : null}
              <span className={`pill ${t.approved ? 'ok' : 'warn'}`}>
                {t.approved ? 'Live' : 'Pending'}
              </span>
            </div>
            <p className="t-text" style={{ margin: '0.55rem 0 0' }}>
              {t.text}
            </p>
            {t.video_url ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--faint)', marginTop: '0.35rem' }}>
                Video:{' '}
                <a href={t.video_url} target="_blank" rel="noopener noreferrer nofollow">
                  {t.video_url}
                </a>
              </div>
            ) : null}
            {t.url ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--faint)' }}>
                Link:{' '}
                <a href={t.url} target="_blank" rel="noopener noreferrer nofollow">
                  {t.url}
                </a>
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
              {t.approved ? (
                <form action={togglePin}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="btn small secondary" type="submit">
                    {t.pinned ? 'Unpin' : 'Pin to top'}
                  </button>
                </form>
              ) : null}
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <button className="btn small danger" type="submit">
                  Delete
                </button>
              </form>
              <span className="sub-meta">{t.created_at} UTC</span>
            </div>
          </div>
        ))
      )}

      <h2>Design &amp; settings</h2>
      <form className="card" action={updateWall} style={{ marginBottom: '1.2rem' }}>
        <input type="hidden" name="id" value={wall.id} />
        <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--gray)' }}>
          Pick how testimonials look on your wall and in your embeds — every style follows your
          accent colour.
        </p>
        <StylePicker current={wall.card_style || 'clean'} accent={wall.accent} />
        <div style={{ borderTop: '1px solid var(--line)', margin: '1.4rem 0' }} />
        <div className="two-col">
          <div className="field">
            <label htmlFor="s-title">Title</label>
            <input id="s-title" name="title" type="text" defaultValue={wall.title} maxLength={100} required />
          </div>
          <div className="field">
            <label htmlFor="s-accent">Accent colour</label>
            <input id="s-accent" name="accent" type="color" defaultValue={wall.accent} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="s-desc">
            Short description <span className="hint">(shown under the wall title)</span>
          </label>
          <input id="s-desc" name="description" type="text" defaultValue={wall.description} maxLength={300} />
        </div>
        <div className="field">
          <label htmlFor="s-prompt">
            Collection prompt{' '}
            <span className="hint">(the question shown on your submit page)</span>
          </label>
          <input
            id="s-prompt"
            name="prompt"
            type="text"
            defaultValue={wall.prompt}
            maxLength={300}
            placeholder="What did we help you achieve?"
          />
        </div>
        <label className="check-row">
          <input type="checkbox" name="collect_photo" defaultChecked={!!wall.collect_photo} />
          Ask for a photo
        </label>
        <label className="check-row">
          <input type="checkbox" name="collect_video" defaultChecked={!!wall.collect_video} />
          Ask for a video link
        </label>
        <label className="check-row">
          <input type="checkbox" name="auto_approve" defaultChecked={!!wall.auto_approve} />
          Auto-approve new submissions
        </label>
        <label className="check-row" style={{ marginBottom: '0.9rem' }}>
          <input
            type="checkbox"
            name="hide_badge"
            defaultChecked={!!wall.hide_badge && plan.canHideBadge}
            disabled={!plan.canHideBadge}
          />
          Hide “Powered by” badge
          {plan.canHideBadge ? null : (
            <span className="hint">
              (<Link href="/dashboard/billing">Pro feature</Link>)
            </span>
          )}
        </label>
        <button className="btn" type="submit">
          Save settings
        </button>
      </form>

      <h2>Danger zone</h2>
      <form className="card" action={deleteWall} style={{ maxWidth: 560 }}>
        <input type="hidden" name="id" value={wall.id} />
        <p style={{ marginTop: 0, fontSize: '0.88rem', color: 'var(--gray)' }}>
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

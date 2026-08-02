'use client';

import { useActionState, useState } from 'react';
import { addTestimonial } from '../../actions';

// Import a testimonial you already have (email, tweet, DM…).
export default function AddTestimonialForm({ wallId }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addTestimonial, {});

  if (!open) {
    return (
      <button className="btn small secondary" type="button" onClick={() => setOpen(true)}>
        + Add a testimonial
      </button>
    );
  }

  return (
    <form className="card" action={formAction} style={{ marginBottom: '1rem' }}>
      <div className="two-col">
        <div className="field">
          <label htmlFor="m-name">Name *</label>
          <input id="m-name" name="name" type="text" required maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="m-role">Role &amp; company</label>
          <input id="m-role" name="role" type="text" maxLength={120} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="m-text">
          Testimonial * <span className="hint">(paste it from an email, tweet or DM)</span>
        </label>
        <textarea id="m-text" name="text" required maxLength={2000} />
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="m-rating">Rating</label>
          <select
            id="m-rating"
            name="rating"
            defaultValue="5"
            style={{
              width: '100%',
              padding: '0.55rem 0.7rem',
              border: '1px solid var(--line-strong)',
              borderRadius: 8,
              font: 'inherit',
              fontSize: '0.92rem',
              color: 'var(--ink)',
              background: '#fff',
            }}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="m-video">
            Video URL <span className="hint">(optional)</span>
          </label>
          <input id="m-video" name="video_url" type="url" maxLength={300} placeholder="https://youtu.be/…" />
        </div>
      </div>
      <input type="hidden" name="wall_id" value={wallId} />
      {state?.error ? (
        <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p style={{ color: 'var(--ok)', fontSize: '0.88rem' }}>Added — it’s live on your wall.</p>
      ) : null}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn small" type="submit" disabled={pending}>
          {pending ? 'Adding…' : 'Add testimonial'}
        </button>
        <button className="btn small ghost" type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    </form>
  );
}

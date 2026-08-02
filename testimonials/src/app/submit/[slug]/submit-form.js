'use client';

import { useState } from 'react';

const STAR = 'M12 2.6l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5-4.9-4.5 6.6-.8z';

export default function SubmitForm({ slug, wallTitle, collectPhoto, collectVideo, autoApprove }) {
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const [submittedText, setSubmittedText] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState('sending');
    setError('');
    try {
      const res = await fetch(`/api/submit/${encodeURIComponent(slug)}`, {
        method: 'POST',
        body: data,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.');
        setState('error');
        return;
      }
      setSubmittedText(String(data.get('text') || ''));
      setState('done');
    } catch {
      setError('Network error. Please try again.');
      setState('error');
    }
  }

  if (state === 'done') {
    const share = `Just shared my experience with ${wallTitle} — happy to recommend it!\n\n“${submittedText.slice(0, 180)}${submittedText.length > 180 ? '…' : ''}”`;
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(share)}`;
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.2rem 1.8rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.3rem' }}>Thank you!</h2>
        <p style={{ color: 'var(--gray)' }}>
          {autoApprove
            ? 'Your testimonial is live on the wall. We really appreciate it.'
            : 'Your testimonial has been submitted and will appear on the wall once approved.'}
        </p>
        <p style={{ color: 'var(--faint)', fontSize: '0.88rem' }}>
          Want to spread the word a little further?
        </p>
        <a className="btn" href={linkedinUrl} target="_blank" rel="noopener noreferrer">
          Share on LinkedIn
        </a>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={onSubmit} style={{ boxShadow: 'var(--shadow-lg)' }}>
      <div className="field">
        <label htmlFor="f-name">Your name *</label>
        <input id="f-name" name="name" type="text" required maxLength={100} autoComplete="name" />
      </div>

      <div className="field">
        <label htmlFor="f-role">
          Role &amp; company <span className="hint">(e.g. “CTO, Acme Inc.”)</span>
        </label>
        <input id="f-role" name="role" type="text" maxLength={120} autoComplete="organization-title" />
      </div>

      <div className="field">
        <label htmlFor="f-url">
          Website or LinkedIn URL <span className="hint">(optional)</span>
        </label>
        <input id="f-url" name="url" type="url" maxLength={300} placeholder="https://…" />
      </div>

      <div className="field">
        <label>Rating *</label>
        <div className="star-input" role="radiogroup" aria-label="Star rating">
          {[5, 4, 3, 2, 1].map((n) => (
            <span key={n} style={{ display: 'contents' }}>
              <input
                type="radio"
                id={`star-${n}`}
                name="rating"
                value={n}
                defaultChecked={n === 5}
                required
              />
              <label htmlFor={`star-${n}`} title={`${n} star${n > 1 ? 's' : ''}`}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d={STAR} fill="currentColor" />
                </svg>
              </label>
            </span>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-text">Your testimonial *</label>
        <textarea
          id="f-text"
          name="text"
          required
          minLength={10}
          maxLength={2000}
          placeholder="What did you like? What changed for you?"
        />
      </div>

      {collectPhoto ? (
        <>
          <div className="field">
            <label htmlFor="f-avatar">
              Photo <span className="hint">(optional — JPG/PNG, we’ll resize it)</span>
            </label>
            <input id="f-avatar" name="avatar" type="file" accept="image/*" />
          </div>

          <div className="field">
            <label htmlFor="f-avatar-url">
              …or a link to your photo <span className="hint">(optional)</span>
            </label>
            <input id="f-avatar-url" name="avatar_url" type="url" maxLength={300} placeholder="https://…" />
          </div>
        </>
      ) : null}

      {collectVideo ? (
        <div className="field">
          <label htmlFor="f-video">
            Video testimonial <span className="hint">(optional — YouTube, Vimeo or Loom link)</span>
          </label>
          <input id="f-video" name="video_url" type="url" maxLength={300} placeholder="https://youtu.be/…" />
        </div>
      ) : null}

      {/* Honeypot — real users never see or fill this. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      {error ? (
        <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>
          {error}
        </p>
      ) : null}

      <button className="btn" type="submit" disabled={state === 'sending'} style={{ width: '100%' }}>
        {state === 'sending' ? 'Sending…' : 'Submit testimonial'}
      </button>
    </form>
  );
}

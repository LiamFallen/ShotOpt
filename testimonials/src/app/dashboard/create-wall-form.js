'use client';

import { useActionState } from 'react';
import { createWall } from './actions';

export default function CreateWallForm() {
  const [state, formAction, pending] = useActionState(createWall, {});
  return (
    <form className="card" action={formAction} style={{ maxWidth: 520 }}>
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
      {state?.error ? (
        <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
          {state.error}
        </p>
      ) : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? 'Creating…' : 'Create wall'}
      </button>
    </form>
  );
}

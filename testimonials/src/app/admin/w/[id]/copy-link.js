'use client';

import { useState } from 'react';

export default function CopyLink({ value, multiline = false }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. non-HTTPS) — text is still selectable.
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
      <div className="copy-link" style={{ flex: 1, whiteSpace: multiline ? 'pre' : 'nowrap' }}>
        {value}
      </div>
      <button type="button" className="btn small secondary" onClick={copy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

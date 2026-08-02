import { PRODUCT_NAME } from '@/lib/config';

export default function Home() {
  return (
    <main className="container narrow">
      <header className="page-header" style={{ marginTop: '3rem' }}>
        <h1>{PRODUCT_NAME}</h1>
        <p>
          Collect testimonials with a shareable form, curate them in a private admin, and show
          them off on a public wall or embed them anywhere with one script tag.
        </p>
      </header>
      <div className="card">
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>
            <a href="/admin">Open the admin</a> to create your first wall (protected by the
            credentials in your <code>.env</code>).
          </li>
          <li>
            Share the wall’s unique <strong>submit link</strong> to collect testimonials.
          </li>
          <li>
            Approve the good ones — they appear on your public wall and in your embeds instantly.
          </li>
        </ul>
      </div>
    </main>
  );
}

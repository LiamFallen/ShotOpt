import Link from 'next/link';
import Stars from '@/components/Stars';
import { currentUser } from '@/lib/auth';
import { PLANS } from '@/lib/plans';
import { PRODUCT_NAME } from '@/lib/config';

export const dynamic = 'force-dynamic';

const SAMPLE = [
  {
    name: 'Sarah Chen',
    role: 'Head of Growth, Driftline',
    rating: 5,
    text: 'We put the wall on our pricing page and trial-to-paid went up 22%. Setup took ten minutes.',
    color: '#0ea5e9',
  },
  {
    name: 'Marcus Webb',
    role: 'Founder, Kettle & Co',
    rating: 5,
    text: 'I sent the link to 30 customers, woke up to 14 testimonials, approved the best ones over coffee.',
    color: '#f97316',
  },
  {
    name: 'Priya Patel',
    role: 'Freelance designer',
    rating: 5,
    text: 'The embed inherits my site’s font so it looks native. Clients think I built it myself.',
    color: '#8b5cf6',
  },
];

function SampleCard({ t }) {
  const initials = t.name.split(' ').map((w) => w[0]).join('');
  return (
    <article className="t-card">
      <div className="t-head">
        <span className="t-avatar initials" style={{ background: t.color }} aria-hidden>
          {initials}
        </span>
        <div>
          <div className="t-name">{t.name}</div>
          <div className="t-role">{t.role}</div>
        </div>
      </div>
      <Stars rating={t.rating} />
      <p className="t-text">{t.text}</p>
    </article>
  );
}

export default async function LandingPage() {
  const user = await currentUser();
  const free = PLANS.free;
  const pro = PLANS.pro;

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="wordmark">
          ♥ {PRODUCT_NAME}
        </Link>
        <div className="links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          {user ? (
            <Link className="btn small" href="/dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link className="btn small" href="/signup">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <span className="kicker">Testimonials that sell for you</span>
        <h1>
          Collect testimonials in minutes. <em>Show them off everywhere.</em>
        </h1>
        <p className="sub">
          {PRODUCT_NAME} gives you a shareable collection link, a beautiful public wall of love,
          and a one-line embed for your website. Text and video, moderated by you.
        </p>
        <div className="cta-row">
          <Link className="btn" href={user ? '/dashboard' : '/signup'}>
            {user ? 'Go to your dashboard' : 'Start free — no card needed'}
          </Link>
          <a className="btn secondary" href="#features">
            See how it works
          </a>
        </div>
        <p className="hero-note">
          Free plan includes {free.maxWalls} wall and {free.maxTestimonialsPerWall} testimonials.
        </p>
      </header>

      <div className="demo-strip">
        <div className="masonry">
          {SAMPLE.map((t) => (
            <SampleCard key={t.name} t={t} />
          ))}
        </div>
      </div>

      <section className="section" id="features">
        <h2>Everything you need for social proof</h2>
        <p className="lead">
          No forms to build, no widgets to code, no screenshots to crop. {PRODUCT_NAME} handles the
          full loop from “can you write us a review?” to a polished wall on your site.
        </p>
        <div className="feature-grid">
          <div className="feature">
            <div className="icon">🔗</div>
            <h3>Shareable collection links</h3>
            <p>
              Every wall gets a unique submit page. Send it in an email, a DM, or a QR code —
              customers leave a testimonial in under a minute, no account needed.
            </p>
          </div>
          <div className="feature">
            <div className="icon">🎬</div>
            <h3>Text and video testimonials</h3>
            <p>
              Star ratings, photos, and YouTube / Vimeo / Loom videos — shown as clean
              click-to-play cards that don’t slow your page down.
            </p>
          </div>
          <div className="feature">
            <div className="icon">🧱</div>
            <h3>A wall of love, hosted for you</h3>
            <p>
              A fast, responsive masonry wall at your own link — dark mode included — with Open
              Graph tags so it looks great shared on LinkedIn and X.
            </p>
          </div>
          <div className="feature">
            <div className="icon">✂️</div>
            <h3>One-line embed, no iframe</h3>
            <p>
              Paste one script tag and the wall renders natively inside your site, inheriting your
              font. Works on any stack: Webflow, WordPress, Framer, plain HTML.
            </p>
          </div>
          <div className="feature">
            <div className="icon">✅</div>
            <h3>You approve everything</h3>
            <p>
              New submissions land in your dashboard as pending. Approve the good ones, they go
              live instantly — everywhere the wall appears.
            </p>
          </div>
          <div className="feature">
            <div className="icon">🎨</div>
            <h3>Your branding</h3>
            <p>
              Custom accent colour, title and description per wall. Pro removes the “Powered by”
              badge for a fully white-label look.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Live in three steps</h2>
        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <h3>Create a wall</h3>
            <p>Sign up free, name your wall, pick an accent colour. Ten seconds, honestly.</p>
          </div>
          <div className="step">
            <div className="num">2</div>
            <h3>Share your link</h3>
            <p>
              Send the collection link to happy customers. They submit text or video testimonials
              — you approve them.
            </p>
          </div>
          <div className="step">
            <div className="num">3</div>
            <h3>Embed and convert</h3>
            <p>
              Drop the one-line embed on your landing page, or share the hosted wall directly.
              Social proof, everywhere.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <h2>Simple pricing</h2>
        <p className="lead">Start free. Upgrade when your wall fills up.</p>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="plan-name">{free.name}</div>
            <div className="amount">
              $0<span>/forever</span>
            </div>
            <ul>
              <li>{free.maxWalls} testimonial wall</li>
              <li>{free.maxTestimonialsPerWall} testimonials</li>
              <li>Text + video testimonials</li>
              <li>Hosted wall + embed</li>
              <li>Moderation dashboard</li>
              <li className="no">“Powered by” badge on walls</li>
            </ul>
            <Link className="btn secondary" href="/signup">
              Start free
            </Link>
          </div>
          <div className="price-card featured">
            <span className="plan-tag">Most popular</span>
            <div className="plan-name">{pro.name}</div>
            <div className="amount">
              ${pro.price}
              <span>/month</span>
            </div>
            <ul>
              <li>Unlimited walls</li>
              <li>Unlimited testimonials</li>
              <li>Text + video testimonials</li>
              <li>Hosted walls + embeds</li>
              <li>Remove the “Powered by” badge</li>
              <li>Priority support</li>
            </ul>
            <Link className="btn" href="/signup">
              Start with Pro
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <h2>Questions, answered</h2>
        <div className="faq">
          <details>
            <summary>Do my customers need an account to leave a testimonial?</summary>
            <p>
              No. The collection link is public — they fill in a name, a rating and their words
              (optionally a photo and a video link) and they’re done.
            </p>
          </details>
          <details>
            <summary>How does the embed work?</summary>
            <p>
              One script tag plus a div. It renders real HTML into your page — no iframe — so it
              inherits your site’s font, supports light/dark themes, and stays fast.
            </p>
          </details>
          <details>
            <summary>Can I moderate what appears on my wall?</summary>
            <p>
              Yes — nothing goes live until you approve it. Unapprove or delete anything at any
              time and it disappears from the wall and every embed instantly.
            </p>
          </details>
          <details>
            <summary>What happens when I hit the free plan’s limits?</summary>
            <p>
              Your wall keeps displaying everything you’ve collected — new submissions pause until
              you upgrade to Pro or make room.
            </p>
          </details>
          <details>
            <summary>Can I cancel Pro anytime?</summary>
            <p>
              Yes, from the billing page in one click. You keep Pro until the end of the period
              you’ve paid for, then drop back to Free without losing your data.
            </p>
          </details>
        </div>
      </section>

      <section className="section">
        <div className="cta-band">
          <h2>Your happiest customers are your best marketing.</h2>
          <p>Give them somewhere to say it. Free to start, live in minutes.</p>
          <Link className="btn" href="/signup">
            Create your wall
          </Link>
        </div>
      </section>

      <footer className="site">
        ♥ {PRODUCT_NAME} — testimonial walls that sell for you ·{' '}
        <a href="#pricing">Pricing</a> · <Link href="/login">Log in</Link> ·{' '}
        <Link href="/signup">Start free</Link>
      </footer>
    </>
  );
}

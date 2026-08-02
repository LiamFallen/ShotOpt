import Link from 'next/link';
import Stars from '@/components/Stars';
import {
  IconLink,
  IconVideo,
  IconGrid,
  IconCode,
  IconShield,
  IconPalette,
  IconCheck,
  IconArrow,
  IconHeartMark,
  IconPin,
  IconDownload,
} from '@/components/icons';
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
    text: 'I sent the link to 30 customers and woke up to 14 testimonials.',
    color: '#e07c3e',
  },
  {
    name: 'Priya Patel',
    role: 'Freelance designer',
    rating: 5,
    text: 'The embed inherits my site’s font so it looks native. Clients think I built it myself.',
    color: '#7c6bfa',
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

const FEATURES = [
  {
    icon: <IconLink />,
    title: 'Shareable collection links',
    text: 'Every wall gets its own submit page. Send it in an email, a DM or a QR code — customers are done in under a minute, no account needed.',
  },
  {
    icon: <IconVideo />,
    title: 'Text and video together',
    text: 'Star ratings, photos, and YouTube, Vimeo or Loom videos — rendered as clean click-to-play cards that never slow your page down.',
  },
  {
    icon: <IconGrid />,
    title: 'A hosted wall of love',
    text: 'A fast, responsive wall at your own URL with Open Graph tags, average-rating header, and pinned favourites at the top.',
  },
  {
    icon: <IconShield />,
    title: 'Moderation built in',
    text: 'Everything lands as pending until you approve it — or flip on auto-approve per wall. Unapprove or delete anytime, everywhere, instantly.',
  },
  {
    icon: <IconPalette />,
    title: 'Your brand, your fields',
    text: 'Accent colour, custom prompt, and per-wall control over which fields you collect. Pro removes the badge entirely.',
  },
  {
    icon: <IconDownload />,
    title: 'Your data, always',
    text: 'Import testimonials you already have from email or social, and export everything to CSV whenever you like. No lock-in.',
  },
];

export default async function LandingPage() {
  const user = await currentUser();
  const free = PLANS.free;
  const pro = PLANS.pro;

  return (
    <>
      <nav className="site-nav">
        <div className="inner">
          <Link href="/" className="wordmark">
            <IconHeartMark /> {PRODUCT_NAME}
          </Link>
          <div className="links">
            <a href="#features">Features</a>
            <a href="#embed">Embed</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            {user ? (
              <Link className="btn small" href="/dashboard">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login">Sign in</Link>
                <Link className="btn small" href="/signup">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="hero-wrap">
        <header className="hero">
          <div>
            <span className="eyebrow">Social proof, done properly</span>
            <h1>Turn happy customers into your best salespeople</h1>
            <p className="sub">
              {PRODUCT_NAME} collects text and video testimonials through a link you share, and
              turns them into a polished wall you can host, embed, and update in seconds.
            </p>
            <div className="cta-row">
              <Link className="btn pill" href={user ? '/dashboard' : '/signup'}>
                {user ? 'Go to dashboard' : 'Start collecting free'}
              </Link>
              <a className="textlink" href="#embed">
                See the embed <IconArrow size={16} />
              </a>
            </div>
            <p className="hero-note">
              Free includes {free.maxWalls} wall and {free.maxTestimonialsPerWall} testimonials. No
              credit card.
            </p>
          </div>
          <div className="hero-cards" aria-hidden>
            {SAMPLE.map((t) => (
              <SampleCard key={t.name} t={t} />
            ))}
          </div>
        </header>
      </div>

      <section className="section" id="features">
        <div className="section-head center">
          <span className="eyebrow">Features</span>
          <h2>Everything between “can you write us a review?” and a wall that converts</h2>
          <p>
            No forms to build, no widgets to code, no screenshots to crop. One tool for the whole
            loop.
          </p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-tint">
        <section className="section" id="embed">
          <div className="split">
            <div>
              <span className="eyebrow">Embed anywhere</span>
              <h2>One snippet. Native on any site.</h2>
              <p>
                The embed renders real HTML into your page — no iframe — so it inherits your font,
                matches your design, and stays fast. Works on Webflow, WordPress, Framer, Next.js,
                or plain HTML.
              </p>
              <ul className="ticks">
                <li>
                  <IconCheck size={15} /> Masonry wall or auto-advancing carousel
                </li>
                <li>
                  <IconCheck size={15} /> Light and dark themes for any host page
                </li>
                <li>
                  <IconCheck size={15} /> Approved testimonials appear instantly
                </li>
                <li>
                  <IconCheck size={15} /> Click-to-play video — nothing loads until asked
                </li>
              </ul>
            </div>
            <div className="code-card">
              <div className="bar">
                <span />
                <span />
                <span />
                <span className="lbl">index.html</span>
              </div>
              <pre>
                <code>
                  <span className="c-tag">&lt;div</span>{' '}
                  <span className="c-attr">data-testimonials-wall</span>=
                  <span className="c-val">&quot;acme&quot;</span>
                  {'\n     '}
                  <span className="c-attr">data-layout</span>=
                  <span className="c-val">&quot;carousel&quot;</span>
                  <span className="c-tag">&gt;&lt;/div&gt;</span>
                  {'\n'}
                  <span className="c-tag">&lt;script</span>{' '}
                  <span className="c-attr">src</span>=
                  <span className="c-val">&quot;https://yoursite.com/embed.js&quot;</span>{' '}
                  <span className="c-attr">async</span>
                  <span className="c-tag">&gt;&lt;/script&gt;</span>
                </code>
              </pre>
            </div>
          </div>
        </section>
      </div>

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">How it works</span>
          <h2>Live in three steps</h2>
        </div>
        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <h3>Create a wall</h3>
            <p>
              Sign up free, name your wall, set your accent colour and the question you want to
              ask.
            </p>
          </div>
          <div className="step">
            <div className="num">2</div>
            <h3>Share your link</h3>
            <p>
              Send the collection link to happy customers. They submit text or video — you approve
              the best.
            </p>
          </div>
          <div className="step">
            <div className="num">3</div>
            <h3>Embed and convert</h3>
            <p>
              Drop the snippet on your landing page or share the hosted wall. New approvals appear
              everywhere, instantly.
            </p>
          </div>
        </div>
      </section>

      <div className="section-tint">
        <section className="section" id="pricing">
          <div className="section-head center">
            <span className="eyebrow">Pricing</span>
            <h2>Start free. Upgrade when your wall fills up.</h2>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="plan-name">{free.name}</div>
              <div className="amount">
                $0<span> forever</span>
              </div>
              <ul>
                <li>
                  <IconCheck size={14} /> {free.maxWalls} testimonial wall
                </li>
                <li>
                  <IconCheck size={14} /> {free.maxTestimonialsPerWall} testimonials
                </li>
                <li>
                  <IconCheck size={14} /> Text + video testimonials
                </li>
                <li>
                  <IconCheck size={14} /> Hosted wall, embed &amp; carousel
                </li>
                <li>
                  <IconCheck size={14} /> Import &amp; CSV export
                </li>
                <li className="no">
                  <IconCheck size={14} /> “Powered by” badge on walls
                </li>
              </ul>
              <Link className="btn secondary" href="/signup">
                Start free
              </Link>
            </div>
            <div className="price-card featured">
              <span className="plan-tag">Recommended</span>
              <div className="plan-name">{pro.name}</div>
              <div className="amount">
                ${pro.price}
                <span> /month</span>
              </div>
              <ul>
                <li>
                  <IconCheck size={14} /> Unlimited walls
                </li>
                <li>
                  <IconCheck size={14} /> Unlimited testimonials
                </li>
                <li>
                  <IconCheck size={14} /> Text + video testimonials
                </li>
                <li>
                  <IconCheck size={14} /> Hosted walls, embeds &amp; carousels
                </li>
                <li>
                  <IconCheck size={14} /> Remove the “Powered by” badge
                </li>
                <li>
                  <IconCheck size={14} /> Priority support
                </li>
              </ul>
              <Link className="btn" href="/signup">
                Start with Pro
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section className="section" id="faq">
        <div className="section-head center">
          <span className="eyebrow">FAQ</span>
          <h2>Questions, answered</h2>
        </div>
        <div className="faq">
          <details>
            <summary>Do my customers need an account to leave a testimonial?</summary>
            <p>
              No. The collection link is public — they add a name, a rating and their words
              (optionally a photo and a video link) and they’re done in under a minute.
            </p>
          </details>
          <details>
            <summary>How does the embed work?</summary>
            <p>
              One script tag plus a div. It renders real HTML into your page — no iframe — so it
              inherits your site’s font, supports light and dark hosts, and offers wall or
              carousel layouts.
            </p>
          </details>
          <details>
            <summary>Can I moderate what appears on my wall?</summary>
            <p>
              Yes — nothing goes live until you approve it, unless you turn on auto-approve for a
              wall. You can pin favourites to the top, and unapprove or delete anything at any
              time.
            </p>
          </details>
          <details>
            <summary>Can I import testimonials I already have?</summary>
            <p>
              Yes. Paste anything you’ve received by email, social or DM straight into your
              dashboard, and it appears on your wall like any other testimonial. Export everything
              as CSV whenever you like.
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

      <div className="cta-band-wrap">
        <div className="cta-band">
          <div>
            <h2>Your happiest customers are your best marketing.</h2>
            <p>Give them somewhere to say it. Free to start, live in minutes.</p>
          </div>
          <Link className="btn pill" href="/signup">
            Create your wall
          </Link>
        </div>
      </div>

      <footer className="site">
        <div className="inner">
          <span className="wordmark" style={{ fontSize: '0.95rem' }}>
            <IconHeartMark size={18} /> {PRODUCT_NAME}
          </span>
          <div className="links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Start free</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

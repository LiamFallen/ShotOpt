import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { planOf, PLANS } from '@/lib/plans';
import { stripeConfigured } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Billing', robots: { index: false } };

export default async function BillingPage({ searchParams }) {
  const user = await requireUser();
  const plan = planOf(user);
  const params = await searchParams;
  const configured = stripeConfigured();

  return (
    <main style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.4rem' }}>Billing</h1>

      {params?.success ? (
        <div className="notice" style={{ borderLeftColor: 'var(--ok)' }}>
          🎉 Thanks for upgrading! Your account is being activated — this page will show Pro within
          a few seconds of Stripe confirming payment (refresh if needed).
        </div>
      ) : null}
      {params?.canceled ? <div className="notice">Checkout canceled — no charge was made.</div> : null}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginTop: 0 }}>
          You’re on the <strong>{plan.name}</strong> plan.
        </p>
        <ul style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          <li>
            {Number.isFinite(plan.maxWalls) ? `${plan.maxWalls} wall` : 'Unlimited walls'}
            {plan.maxWalls === 1 ? '' : Number.isFinite(plan.maxWalls) ? 's' : ''}
          </li>
          <li>
            {Number.isFinite(plan.maxTestimonialsPerWall)
              ? `${plan.maxTestimonialsPerWall} testimonials per wall`
              : 'Unlimited testimonials'}
          </li>
          <li>{plan.canHideBadge ? 'Badge removal included' : '“Powered by” badge on walls and embeds'}</li>
        </ul>

        {plan.key === 'free' ? (
          configured ? (
            <form action="/api/billing/checkout" method="POST">
              <button className="btn" type="submit">
                Upgrade to Pro — ${PLANS.pro.price}/month
              </button>
            </form>
          ) : (
            <div className="notice" style={{ marginBottom: 0 }}>
              <strong>Stripe isn’t connected yet.</strong> Upgrades go live as soon as
              STRIPE_SECRET_KEY, STRIPE_PRICE_ID and STRIPE_WEBHOOK_SECRET are set — the checkout,
              webhook and customer portal are already wired up. See “Connect Stripe” in the README.
            </div>
          )
        ) : configured ? (
          <form action="/api/billing/portal" method="POST">
            <button className="btn secondary" type="submit">
              Manage subscription
            </button>
          </form>
        ) : null}
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
        Questions about plans? See <Link href="/#pricing">pricing</Link>.
      </p>
    </main>
  );
}

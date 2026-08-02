import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { planOf, PLANS } from '@/lib/plans';
import { stripeConfigured } from '@/lib/billing';
import { IconCheck } from '@/components/icons';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Billing', robots: { index: false } };

export default async function BillingPage({ searchParams }) {
  const user = await requireUser();
  const plan = planOf(user);
  const params = await searchParams;
  const configured = stripeConfigured();

  return (
    <main style={{ maxWidth: 640 }}>
      <div className="content-head">
        <h1>Billing</h1>
      </div>

      {params?.success ? (
        <div className="notice ok">
          Thanks for upgrading! Your account activates within a few seconds of Stripe confirming
          payment — refresh if needed.
        </div>
      ) : null}
      {params?.canceled ? <div className="notice">Checkout canceled — no charge was made.</div> : null}

      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <p style={{ marginTop: 0, color: 'var(--ink)' }}>
          You’re on the <strong>{plan.name}</strong> plan.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.2rem', color: 'var(--gray)', fontSize: '0.9rem' }}>
          <li style={{ display: 'flex', gap: '0.5rem', padding: '0.2rem 0' }}>
            <IconCheck size={14} style={{ color: 'var(--ok)', marginTop: 4 }} />
            {Number.isFinite(plan.maxWalls)
              ? `${plan.maxWalls} wall${plan.maxWalls === 1 ? '' : 's'}`
              : 'Unlimited walls'}
          </li>
          <li style={{ display: 'flex', gap: '0.5rem', padding: '0.2rem 0' }}>
            <IconCheck size={14} style={{ color: 'var(--ok)', marginTop: 4 }} />
            {Number.isFinite(plan.maxTestimonialsPerWall)
              ? `${plan.maxTestimonialsPerWall} testimonials per wall`
              : 'Unlimited testimonials'}
          </li>
          <li style={{ display: 'flex', gap: '0.5rem', padding: '0.2rem 0' }}>
            <IconCheck size={14} style={{ color: 'var(--ok)', marginTop: 4 }} />
            {plan.canHideBadge
              ? 'Badge removal included'
              : '“Powered by” badge on walls and embeds'}
          </li>
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
              <span>
                <strong>Stripe isn’t connected yet.</strong> Upgrades go live as soon as
                STRIPE_SECRET_KEY, STRIPE_PRICE_ID and STRIPE_WEBHOOK_SECRET are set — checkout,
                webhook and customer portal are already wired. See “Connect Stripe” in the README.
              </span>
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

      <p style={{ color: 'var(--faint)', fontSize: '0.85rem' }}>
        Questions about plans? See <Link href="/#pricing">pricing</Link>.
      </p>
    </main>
  );
}

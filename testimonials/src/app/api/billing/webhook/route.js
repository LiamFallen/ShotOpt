import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing';
import { run } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function setPlanByCustomer(customerId, plan, subscriptionId = null) {
  await run('UPDATE users SET plan = ?, stripe_subscription_id = ? WHERE stripe_customer_id = ?', [
    plan,
    subscriptionId,
    customerId,
  ]);
}

// Stripe webhook: keeps users.plan in sync with subscription state.
// Configure the endpoint in the Stripe dashboard pointing at
//   {APP_URL}/api/billing/webhook
// with events: checkout.session.completed, customer.subscription.updated,
// customer.subscription.deleted — then set STRIPE_WEBHOOK_SECRET.
export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret) {
    return new NextResponse('Stripe webhook not configured', { status: 503 });
  }
  const stripe = await getStripe();
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode === 'subscription') {
        await setPlanByCustomer(session.customer, 'pro', session.subscription);
      }
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const active = sub.status === 'active' || sub.status === 'trialing';
      await setPlanByCustomer(sub.customer, active ? 'pro' : 'free', active ? sub.id : null);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await setPlanByCustomer(sub.customer, 'free', null);
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}

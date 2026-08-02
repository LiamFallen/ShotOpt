import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { stripeConfigured, getStripe } from '@/lib/billing';
import { run } from '@/lib/db';
import { appUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Creates a Stripe Checkout session for the Pro subscription.
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.redirect(`${appUrl()}/login`, 303);
  if (!stripeConfigured()) {
    return new NextResponse('Stripe is not configured — see README.', { status: 503 });
  }
  const stripe = await getStripe();

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: String(user.id) },
    });
    customerId = customer.id;
    await run('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, user.id]);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl()}/dashboard/billing?success=1`,
    cancel_url: `${appUrl()}/dashboard/billing?canceled=1`,
    metadata: { userId: String(user.id) },
    subscription_data: { metadata: { userId: String(user.id) } },
    allow_promotion_codes: true,
  });
  return NextResponse.redirect(session.url, 303);
}

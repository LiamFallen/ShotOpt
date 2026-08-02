import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { stripeConfigured, getStripe } from '@/lib/billing';
import { appUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Opens the Stripe customer portal (cancel / change card / invoices).
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.redirect(`${appUrl()}/login`, 303);
  if (!stripeConfigured() || !user.stripe_customer_id) {
    return NextResponse.redirect(`${appUrl()}/dashboard/billing`, 303);
  }
  const stripe = await getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appUrl()}/dashboard/billing`,
  });
  return NextResponse.redirect(session.url, 303);
}

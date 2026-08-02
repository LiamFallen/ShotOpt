// Stripe is optional until keys are configured — every entry point checks
// stripeConfigured() first and shows setup instructions otherwise.
export function stripeConfigured() {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export async function getStripe() {
  const Stripe = (await import('stripe')).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

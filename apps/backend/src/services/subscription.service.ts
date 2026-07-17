import Stripe from 'stripe';
import { TeacherSubscription } from '../models';

const APP_URL = process.env.APP_URL || 'http://localhost:4201';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'your_stripe_secret') {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: '2023-08-16' });
  }
  return stripeClient;
}

// Every teacher implicitly has a free subscription; the row is created lazily.
export async function getOrCreateSubscription(teacherId: string): Promise<TeacherSubscription> {
  const [subscription] = await TeacherSubscription.findOrCreate({
    where: { teacherId },
    defaults: { teacherId, stripeCustomerId: null, stripeSubscriptionId: null },
  });
  return subscription;
}

export function isPremium(subscription: TeacherSubscription): boolean {
  return subscription.tier === 'premium' && subscription.status === 'active';
}

export async function createCheckoutSession(teacherId: string, teacherEmail: string): Promise<string> {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error('STRIPE_PRICE_ID is not configured.');
  }
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: teacherEmail,
    client_reference_id: teacherId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/teacher?upgrade=success`,
    cancel_url: `${APP_URL}/teacher?upgrade=canceled`,
  });
  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.');
  }
  return session.url;
}

// --- Webhook event handlers (exported separately so they're unit-testable) ---

export async function handleCheckoutCompleted(session: {
  client_reference_id: string | null;
  customer: string | null;
  subscription: string | null;
}): Promise<void> {
  if (!session.client_reference_id) return;
  const subscription = await getOrCreateSubscription(session.client_reference_id);
  subscription.tier = 'premium';
  subscription.status = 'active';
  subscription.stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;
  subscription.stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
  await subscription.save();
}

export async function handleSubscriptionUpdated(stripeSub: {
  id: string;
  status: string;
}): Promise<void> {
  const subscription = await TeacherSubscription.findOne({
    where: { stripeSubscriptionId: stripeSub.id },
  });
  if (!subscription) return;
  if (stripeSub.status === 'active' || stripeSub.status === 'trialing') {
    subscription.tier = 'premium';
    subscription.status = 'active';
  } else if (stripeSub.status === 'past_due' || stripeSub.status === 'unpaid') {
    subscription.status = 'past_due';
  } else {
    // canceled, incomplete_expired, etc. — back to free.
    subscription.tier = 'free';
    subscription.status = 'canceled';
  }
  await subscription.save();
}

export async function handleSubscriptionDeleted(stripeSub: { id: string }): Promise<void> {
  const subscription = await TeacherSubscription.findOne({
    where: { stripeSubscriptionId: stripeSub.id },
  });
  if (!subscription) return;
  subscription.tier = 'free';
  subscription.status = 'canceled';
  subscription.stripeSubscriptionId = null;
  await subscription.save();
}

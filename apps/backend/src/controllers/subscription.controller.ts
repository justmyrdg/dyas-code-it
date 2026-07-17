import type { NextFunction, Request, Response } from 'express';
import {
  createCheckoutSession,
  getOrCreateSubscription,
  getStripe,
  handleCheckoutCompleted,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from '../services/subscription.service';
import { FREE_TIER_CLASS_LIMIT } from '../config/limits';
import { sendError } from '../utils/http';

export async function getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await getOrCreateSubscription(req.user!.sub);
    res.json({
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        freeClassLimit: FREE_TIER_CLASS_LIMIT,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function startCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const url = await createCheckoutSession(req.user!.sub, req.user!.email);
    res.json({ url });
  } catch (err) {
    if (err instanceof Error && err.message.includes('not configured')) {
      sendError(res, 503, 'payments_unavailable', 'Payments are not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID.');
      return;
    }
    next(err);
  }
}

// Stripe webhook — mounted with express.raw() BEFORE the JSON body parser so the
// signature can be verified against the exact bytes Stripe sent.
export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];
  if (!webhookSecret || typeof signature !== 'string') {
    res.status(400).json({ error: { code: 'bad_webhook', message: 'Missing webhook secret or signature.' } });
    return;
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body as Buffer, signature, webhookSecret);
  } catch {
    res.status(400).json({ error: { code: 'bad_signature', message: 'Webhook signature verification failed.' } });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as never);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as never);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as never);
        break;
      default:
        break; // Unhandled event types are acknowledged without action.
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handling failed:', err);
    res.status(500).json({ error: { code: 'webhook_failed', message: 'Webhook handling failed.' } });
  }
}

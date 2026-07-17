"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscription = getSubscription;
exports.startCheckout = startCheckout;
exports.stripeWebhook = stripeWebhook;
const subscription_service_1 = require("../services/subscription.service");
const limits_1 = require("../config/limits");
const http_1 = require("../utils/http");
async function getSubscription(req, res, next) {
    try {
        const subscription = await (0, subscription_service_1.getOrCreateSubscription)(req.user.sub);
        res.json({
            subscription: {
                tier: subscription.tier,
                status: subscription.status,
                freeClassLimit: limits_1.FREE_TIER_CLASS_LIMIT,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function startCheckout(req, res, next) {
    try {
        const url = await (0, subscription_service_1.createCheckoutSession)(req.user.sub, req.user.email);
        res.json({ url });
    }
    catch (err) {
        if (err instanceof Error && err.message.includes('not configured')) {
            (0, http_1.sendError)(res, 503, 'payments_unavailable', 'Payments are not configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID.');
            return;
        }
        next(err);
    }
}
// Stripe webhook — mounted with express.raw() BEFORE the JSON body parser so the
// signature can be verified against the exact bytes Stripe sent.
async function stripeWebhook(req, res) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers['stripe-signature'];
    if (!webhookSecret || typeof signature !== 'string') {
        res.status(400).json({ error: { code: 'bad_webhook', message: 'Missing webhook secret or signature.' } });
        return;
    }
    let event;
    try {
        event = (0, subscription_service_1.getStripe)().webhooks.constructEvent(req.body, signature, webhookSecret);
    }
    catch {
        res.status(400).json({ error: { code: 'bad_signature', message: 'Webhook signature verification failed.' } });
        return;
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await (0, subscription_service_1.handleCheckoutCompleted)(event.data.object);
                break;
            case 'customer.subscription.updated':
                await (0, subscription_service_1.handleSubscriptionUpdated)(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await (0, subscription_service_1.handleSubscriptionDeleted)(event.data.object);
                break;
            default:
                break; // Unhandled event types are acknowledged without action.
        }
        res.json({ received: true });
    }
    catch (err) {
        console.error('Stripe webhook handling failed:', err);
        res.status(500).json({ error: { code: 'webhook_failed', message: 'Webhook handling failed.' } });
    }
}
//# sourceMappingURL=subscription.controller.js.map
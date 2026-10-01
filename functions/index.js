import { defineSecret } from "firebase-functions/params";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const stripeSecret = ""; // this is not freedefineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// Prices live in the Stripe dashboard; lookup keys let us change them without touching the code
const PLANS = {
  monthly: { lookupKey: "pro_monthly" },
  annual: { lookupKey: "pro_annual" },
};

const CLIENT_URL = "http://localhost:5173"; // porta di Vite, cambiala se diversa

// Stripe webhook: the only place allowed to grant a plan to a user
export const stripeWebhook = onRequest(
  { secrets: [stripeSecret, stripeWebhookSecret] },
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const stripe = new Stripe(stripeSecret.value());
    let event;
    try {
      // The signature is computed on the raw body, never on parsed JSON
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        stripeWebhookSecret.value(),
      );
    } catch (err) {
      console.error("Invalid webhook signature:", err.message);
      res.status(400).send("Invalid signature");
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const uid = session.client_reference_id;
      const plan = session.metadata?.plan;

      if (session.payment_status === "paid" && uid && PLANS[plan]) {
        // set + merge keeps the handler idempotent if Stripe retries the event
        await db.doc(`users/${uid}`).set(
          {
            plan,
            subscriptionStatus: "active",
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        console.log(`Plan "${plan}" activated for user ${uid}`);
      }
    }

    res.json({ received: true });
  },
);

export const createCheckout = onCall(
  { secrets: [stripeSecret] },
  async (req) => {
    if (!req.auth) throw new HttpsError("unauthenticated", "login is required");

    const selectedPlan = PLANS[req.data.plan];
    if (!selectedPlan)
      throw new HttpsError("invalid-argument", "Invalid plan subscription");

    const stripe = new Stripe(stripeSecret.value());

    const { data: prices } = await stripe.prices.list({
      lookup_keys: [selectedPlan.lookupKey],
      active: true,
      limit: 1,
    });
    if (prices.length === 0) {
      console.error(
        `No active Stripe price for lookup key "${selectedPlan.lookupKey}"`,
      );
      throw new HttpsError("failed-precondition", "Plan is not available");
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        allow_promotion_codes: true,
        line_items: [{ price: prices[0].id, quantity: 1 }],
        success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL}/cancel`,
        client_reference_id: req.auth.uid,
        metadata: { plan: req.data.plan },
      });

      return { url: session.url };
    } catch (err) {
      console.error("Error Stripe:", err);
      throw new HttpsError("internal", "Unable to create checkout session");
    }
  },
);

import { defineSecret } from "firebase-functions/params";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

const PLANS = {
  monthly: { name: "Monthly plan", amount: 1500, interval: "month" },
  annual: { name: "Annual plan", amount: 14000, interval: "year" },
};

const CLIENT_URL = "http://localhost:5173"; // porta di Vite, cambiala se diversa

// Stripe webhook: the only place allowed to grant a plan to a user
export const stripeWebhook = onRequest(
  { secrets: [stripeSecret, stripeWebhookSecret] },
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

    try {
      const stripe = new Stripe(stripeSecret.value());

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "chf",
              unit_amount: selectedPlan.amount,
              recurring: { interval: selectedPlan.interval },
              product_data: { name: selectedPlan.name },
            },
          },
        ],
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

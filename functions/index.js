import { defineSecret } from "firebase-functions/params";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";

const stripeSecret = defineSecret("STRIPE_SECRET_KEY");

const PLANS = {
  monthly: { name: "Monthly plan", amount: 1500, interval: "month" },
  annual: { name: "Annual plan", amount: 14000, interval: "year" },
};

const CLIENT_URL = "http://localhost:5173"; // porta di Vite, cambiala se diversa

// Placeholder: qui andrà il webhook Stripe
export const helloWorld = onRequest((req, res) => {
  res.json({ ok: true });
});

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
      });

      return { url: session.url };
    } catch (err) {
      console.error("Error Stripe:", err);
      throw new HttpsError("internal", "Unable to create checkout session");
    }
  },
);

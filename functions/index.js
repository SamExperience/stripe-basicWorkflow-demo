import { onRequest } from "firebase-functions/v2/https";

// Placeholder: qui andrà il webhook Stripe
export const helloWorld = onRequest((req, res) => {
  res.json({ ok: true });
});

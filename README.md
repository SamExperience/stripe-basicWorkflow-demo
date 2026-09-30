# Stripe Demo

A demo of a Stripe subscription flow built with React (Vite), Tailwind CSS, Firebase (Auth, Firestore, Cloud Functions v2) and Stripe Checkout. It runs locally with the Firebase Emulator Suite and the Stripe Sandbox.

## Tech Stack

- **React** 19
- **Vite** 8 (build tool)
- **Tailwind CSS** 4
- **Firebase** Auth, Firestore and Cloud Functions v2 (emulators)
- **Stripe** Checkout in subscription mode
- **Oxlint** (code linter)

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (Firebase config): copy `.env.example` to `.env.local` and fill in the values.

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`).

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the development server with hot module reload |
| `npm run build` | Build the project for production |
| `npm run lint` | Run Oxlint to check code quality |
| `npm run preview` | Preview the production build locally |

## How it works

1. The user signs up with email and password (Firebase Auth).
2. The pricing page calls the `createCheckout` callable with only the plan id. Price and interval come from the server-side `PLANS` catalog.
3. The user pays on Stripe Checkout and returns to `/success` or `/cancel`.
4. Stripe calls the `stripeWebhook` function. It verifies the signature and writes the plan to `users/{uid}` in Firestore.
5. The client listens to that document and shows the current plan.

The `/success` page never grants a plan: only the verified webhook does. Firestore rules allow clients to read their own document and never write it.

## Secrets

- Never put Stripe keys in the client. Only public `VITE_*` variables go in `.env.local`.
- Emulator secrets go in `functions/.secret.local` (git-ignored):
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

## Test locally

1. Start the emulators: `npm run emulators`
2. Start the client: `npm run dev`
3. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli), run `stripe login`, then forward events:
   ```bash
   stripe listen --forward-to localhost:5001/stripe-demo-5f279/us-central1/stripeWebhook
   ```
   Copy the printed `whsec_...` into `functions/.secret.local` as `STRIPE_WEBHOOK_SECRET` and restart the emulators.
4. Sign up, choose a paid plan and pay with the test card `4242 4242 4242 4242` (any future expiry, any CVC).
5. After the redirect, the plan card shows "Current plan". Check `users/{uid}` in the Emulator UI at `http://localhost:4000`.

## Project Structure

```
src/
├── context/AuthContext.jsx   # Auth session provider
├── hooks/usePlan.js          # Live plan from Firestore
├── components/               # Layout, ProtectedRoute
├── pages/                    # Auth, Home (pricing), Success, Cancel
└── services/                 # Firebase setup
functions/index.js            # createCheckout and stripeWebhook
firestore.rules               # Client read-only access to own profile
```

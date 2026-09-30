import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../services/firebase";

// Display only: the real price is always decided by the server (PLANS in functions/index.js)
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "CHF 0",
    period: "forever",
    features: ["Basic features", "Community support"],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "CHF 15",
    period: "per month",
    features: ["Everything in Free", "Priority support", "Cancel anytime"],
  },
  {
    id: "annual",
    name: "Annual",
    price: "CHF 140",
    period: "per year",
    features: ["Everything in Monthly", "Save about 22%"],
    highlight: true,
  },
];

const createCheckout = httpsCallable(functions, "createCheckout");

export default function Home() {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  async function handleSubscribe(planId) {
    setError("");
    setLoadingPlan(planId);
    try {
      const { data } = await createCheckout({ plan: planId });
      window.location.assign(data.url);
    } catch (err) {
      console.error(err);
      setError("Unable to start checkout. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Choose your plan</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Start free and upgrade whenever you need more.
      </p>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <section
            key={plan.id}
            className={`flex flex-col rounded-2xl border bg-zinc-900/50 p-6 ${
              plan.highlight ? "border-zinc-500" : "border-zinc-800"
            }`}
          >
            <h2 className="text-sm font-medium text-zinc-400">{plan.name}</h2>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {plan.price}
            </p>
            <p className="text-sm text-zinc-500">{plan.period}</p>

            <ul className="mt-6 flex-1 space-y-2 text-sm text-zinc-300">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            {plan.id === "free" ? (
              <p className="mt-8 text-sm text-zinc-500">Included</p>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan !== null}
                className="mt-8 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
              >
                {loadingPlan === plan.id ? "Redirecting..." : "Subscribe"}
              </button>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

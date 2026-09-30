import { Link } from "react-router-dom";

export default function Success() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Payment received</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Thank you! Your subscription is being activated and your plan will
        update in a few moments.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
      >
        Back to plans
      </Link>
    </main>
  );
}

import { signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import { useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Auth />;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Stripe Demo</h1>
      <p className="mt-2 text-sm text-zinc-400">Signed in as {user.email}</p>
      <button
        onClick={() => signOut(auth)}
        className="mt-6 text-sm text-zinc-400 hover:text-zinc-200"
      >
        Sign out
      </button>
    </main>
  );
}

export default App;

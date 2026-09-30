import { Link, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-900">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            Stripe Demo
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="transition hover:text-zinc-100"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

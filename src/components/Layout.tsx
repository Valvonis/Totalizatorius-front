import { Link } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { useAuth } from "../features/auth/useAuth";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch } from "../hooks";
import Scoreboard from "../features/scoreboard/Scoreboard";
import { LogOut, Shield, Home } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { player, isAdmin } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);

  return (
    <div className="min-h-screen">
      <header className="bg-[var(--color-primary)] border-b border-white/20 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <h1 className="text-white text-xl max-sm:text-lg font-bold tracking-widest">
              {tournament?.name ?? "TOTALIZATORIUS"}
            </h1>
          </Link>

          <Scoreboard />

          <div className="flex items-center gap-3">
            <nav className="flex gap-2">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                <Home size={20} />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-white/80 hover:text-white transition-colors">
                  <Shield size={20} />
                </Link>
              )}
            </nav>
            {player && (
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span className="max-sm:hidden">{player.name}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

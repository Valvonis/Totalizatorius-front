import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { useAuth } from "../features/auth/useAuth";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch } from "../hooks";
import { fetchAllTournaments, switchTournament } from "../features/tournaments/tournamentSlice";
import { fetchMatches } from "../features/matches/matchesSlice";
import { fetchLeaderboard } from "../features/scoreboard/scoreboardSlice";
import { fetchQuestions } from "../features/questions/questionsSlice";
import Scoreboard from "../features/scoreboard/Scoreboard";
import { LogOut, Shield, Home, ChevronDown, Sun, Moon, BarChart3 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { player, isAdmin } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const allTournaments = useAppSelector((s) => s.tournament.all);

  const [theme, setTheme] = useState<"stadium" | "gradient">(() => {
    return (localStorage.getItem("bg-theme") as "stadium" | "gradient") || "stadium";
  });

  useEffect(() => {
    document.body.classList.remove("theme-stadium", "theme-gradient");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("bg-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "stadium" ? "gradient" : "stadium"));
  }, []);

  useEffect(() => {
    dispatch(fetchAllTournaments());
  }, [dispatch]);

  const handleSwitchTournament = (id: string) => {
    dispatch(switchTournament(id));
    dispatch(fetchMatches(id));
    dispatch(fetchLeaderboard(id));
    dispatch(fetchQuestions(id));
  };

  return (
    <div className="min-h-screen">
      <header className={`border-b sticky top-0 z-30 shadow-lg backdrop-blur-md transition-colors duration-500 ${theme === "stadium" ? "bg-[#0d1328]/90 border-white/10" : "bg-[var(--color-primary)]/95 border-white/20"}`}>
        {/* Top row: branding + nav */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/" className="no-underline flex items-center gap-2">
              {tournament?.logoUrl && (
                <img src={tournament.logoUrl} alt="" className="h-10 w-10 object-contain" />
              )}
              <h1 className="text-white text-xl max-sm:text-lg font-bold">
                {tournament?.name ?? "TOTALIZATORIUS"}
              </h1>
            </Link>
            {allTournaments.length > 1 && (
              <div className="relative max-sm:hidden">
                <select
                  value={tournament?._id ?? ""}
                  onChange={(e) => handleSwitchTournament(e.target.value)}
                  className="appearance-none bg-white/10 text-white text-xs border border-white/20 rounded-lg px-2 py-1 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors hover:bg-white/20"
                >
                  {allTournaments.map((t) => (
                    <option key={t._id} value={t._id} className="text-black">
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Scoreboard — visible on md+ in top row */}
          <div className="max-md:hidden">
            <Scoreboard />
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex gap-2">
              <Link to="/" className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <Home size={20} />
              </Link>
              <Link to="/leaderboard" className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <BarChart3 size={20} />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                  <Shield size={20} />
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                title={theme === "stadium" ? "Perjungti į gradientą" : "Perjungti į stadiono apšvietimą"}
              >
                {theme === "stadium" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </nav>
            {player && (
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10"
              >
                <LogOut size={16} />
                <span className="max-sm:hidden">{player.name}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom row on mobile: scoreboard + tournament switcher */}
        <div className="md:hidden border-t border-white/10 px-4 py-2 flex items-center justify-between gap-2">
          <Scoreboard />
          {allTournaments.length > 1 && (
            <div className="relative">
              <select
                value={tournament?._id ?? ""}
                onChange={(e) => handleSwitchTournament(e.target.value)}
                className="appearance-none bg-white/10 text-white text-xs border border-white/20 rounded-lg px-2 py-1 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {allTournaments.map((t) => (
                  <option key={t._id} value={t._id} className="text-black">
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 page-enter">{children}</main>
    </div>
  );
}

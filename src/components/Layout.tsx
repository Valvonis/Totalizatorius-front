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
import { LogOut, Shield, Home, ChevronDown, Sun, Moon, BarChart3, KeyRound, Save, Loader2 } from "lucide-react";
import { dayjs } from "../utils/date";
import api from "../api/client";
import { showToast } from "./ui/Toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { player, isAdmin } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const allTournaments = useAppSelector((s) => s.tournament.all);

  const [theme, setTheme] = useState<"stadium" | "gradient">(() => {
    return (localStorage.getItem("bg-theme") as "stadium" | "gradient") || "stadium";
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    document.body.classList.remove("theme-stadium", "theme-gradient");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("bg-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "stadium" ? "gradient" : "stadium"));
  }, []);

  const handleChangePin = async () => {
    if (!currentPin || newPin.length < 4) return;
    setPinLoading(true);
    try {
      await api.patch("/auth/pin", { currentPin, newPin });
      showToast("PIN sėkmingai pakeistas!", "success");
      setShowPinChange(false);
      setShowUserMenu(false);
      setCurrentPin("");
      setNewPin("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || "Nepavyko pakeisti PIN", "error");
    } finally {
      setPinLoading(false);
    }
  };

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
              <div>
                <h1 className="text-white text-xl max-sm:text-lg font-bold leading-tight">
                  {tournament?.name ?? "TOTALIZATORIUS"}
                </h1>
                {tournament?.startDate && (
                  <span className="text-white/40 text-[10px] font-medium">
                    {dayjs(tournament.startDate).format("YYYY.MM.DD")} – {dayjs(tournament.endDate).format("MM.DD")}
                  </span>
                )}
              </div>
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
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10"
                >
                  <span className="max-sm:hidden">{player.name}</span>
                  <ChevronDown size={12} />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => { setShowUserMenu(false); setShowPinChange(false); }} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[200px] animate-scale-in">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="font-bold text-sm text-gray-900">{player.name}</div>
                        <div className="text-[10px] text-gray-400">{player.slug}</div>
                      </div>

                      {!showPinChange ? (
                        <>
                          <button
                            onClick={() => setShowPinChange(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <KeyRound size={14} />
                            Keisti PIN
                          </button>
                          <button
                            onClick={() => { dispatch(logout()); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            <LogOut size={14} />
                            Atsijungti
                          </button>
                        </>
                      ) : (
                        <div className="px-3 py-2 flex flex-col gap-2">
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="Dabartinis PIN"
                            value={currentPin}
                            onChange={(e) => setCurrentPin(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center tracking-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="Naujas PIN"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center tracking-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleChangePin}
                              disabled={pinLoading || !currentPin || newPin.length < 4}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-[var(--color-primary-light)] disabled:opacity-40 transition-colors"
                            >
                              {pinLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                              Išsaugoti
                            </button>
                            <button
                              onClick={() => { setShowPinChange(false); setCurrentPin(""); setNewPin(""); }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                              Atšaukti
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
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

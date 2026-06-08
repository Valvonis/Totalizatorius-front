import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { login, clearError } from "./authSlice";
import api from "../../api/client";
import type { Player } from "../../types";
import { Trophy, Loader2 } from "lucide-react";

// The original friend group logs in here; new groups use /join/:leagueSlug.
const ORIGINAL_LEAGUE_SLUG = "original";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isLoggedIn } = useAppSelector((s) => ({
    loading: s.auth.loading,
    error: s.auth.error,
    isLoggedIn: !!s.auth.token,
  }));

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    api
      .get<Player[]>(`/players/by-league/${ORIGINAL_LEAGUE_SLUG}`)
      .then(({ data }) => setPlayers(data))
      .catch(() => setPlayers([]));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug || !pin) return;
    dispatch(login({ slug: selectedSlug, pin }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0f1e", backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(33, 54, 144, 0.5) 0%, transparent 70%)" }}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-5 animate-scale-in"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Trophy size={28} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900">TOTALIZATORIUS</h1>
          <p className="text-center text-gray-400 text-sm">Pasirinkite savo vardą ir įveskite PIN</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm text-center flex items-center justify-center gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => dispatch(clearError())} className="underline cursor-pointer font-medium">
              Gerai
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {players.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setSelectedSlug(p.slug)}
              className={`py-3.5 px-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                selectedSlug === p.slug
                  ? "bg-[var(--color-primary)] text-white shadow-lg scale-[1.03]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="PIN kodas"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-center text-xl tracking-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 transition-colors focus:bg-white"
        />

        <button
          type="submit"
          disabled={loading || !selectedSlug || pin.length < 4}
          className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--color-primary-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Jungiamasi...
            </>
          ) : (
            "Prisijungti"
          )}
        </button>
      </form>
    </div>
  );
}

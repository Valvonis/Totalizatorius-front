import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { login, joinLeague, clearError } from "./authSlice";
import api from "../../api/client";
import type { Player } from "../../types";
import { Trophy, Loader2, UserPlus, Users } from "lucide-react";

interface LeagueInfo {
  name: string;
  slug: string;
  logoUrl: string;
  memberCount: number;
  isFull: boolean;
}

export default function JoinPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { leagueSlug = "" } = useParams();
  const { loading, error, isLoggedIn } = useAppSelector((s) => ({
    loading: s.auth.loading,
    error: s.auth.error,
    isLoggedIn: !!s.auth.token,
  }));

  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<"new" | "returning">("new");

  // New member
  const [name, setName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [leaguePin, setLeaguePin] = useState("");

  // Returning member
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    api
      .get<LeagueInfo>(`/leagues/by-slug/${leagueSlug}`)
      .then(({ data }) => setLeagueInfo(data))
      .catch(() => setNotFound(true));
  }, [leagueSlug]);

  useEffect(() => {
    if (mode === "returning") {
      api
        .get<Player[]>(`/players/by-league/${leagueSlug}`)
        .then(({ data }) => setPlayers(data))
        .catch(() => setPlayers([]));
    }
  }, [mode, leagueSlug]);

  const switchMode = (next: "new" | "returning") => {
    setMode(next);
    dispatch(clearError());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || newPin.length < 4 || !leaguePin) return;
    dispatch(joinLeague({ leagueSlug, leaguePin, name, pin: newPin }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug || pin.length < 4) return;
    dispatch(login({ slug: selectedSlug, pin }));
  };

  const wrap = (inner: React.ReactNode) => (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "#0a0f1e",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(33, 54, 144, 0.5) 0%, transparent 70%)",
      }}
    >
      {inner}
    </div>
  );

  if (notFound) {
    return wrap(
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 animate-scale-in text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <Trophy size={28} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Grupė nerasta</h1>
        <p className="text-gray-400 text-sm">Patikrinkite nuorodą ir bandykite dar kartą.</p>
        <Link to="/login" className="text-[var(--color-primary)] text-sm font-medium hover:underline">
          Grįžti į prisijungimą
        </Link>
      </div>
    );
  }

  const tabClass = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
      active ? "bg-[var(--color-primary)] text-white shadow" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
    }`;

  return wrap(
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-5 animate-scale-in">
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center overflow-hidden">
          {leagueInfo?.logoUrl ? (
            <img src={leagueInfo.logoUrl} alt="" className="h-14 w-14 object-contain" />
          ) : (
            <Trophy size={28} className="text-[var(--color-primary)]" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900">{leagueInfo?.name ?? "..."}</h1>
        <p className="text-center text-gray-400 text-sm">
          {leagueInfo ? `${leagueInfo.memberCount} dalyviai` : "Kraunama..."}
        </p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => switchMode("new")} className={tabClass(mode === "new")}>
          <UserPlus size={15} />
          Esu naujas
        </button>
        <button type="button" onClick={() => switchMode("returning")} className={tabClass(mode === "returning")}>
          <Users size={15} />
          Jau dalyvauju
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm text-center flex items-center justify-center gap-2">
          <span>{error}</span>
          <button type="button" onClick={() => dispatch(clearError())} className="underline cursor-pointer font-medium">
            Gerai
          </button>
        </div>
      )}

      {mode === "new" ? (
        leagueInfo?.isFull ? (
          <p className="text-center text-gray-500 text-sm py-4">Grupė jau pilna.</p>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Jūsų vardas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 transition-colors focus:bg-white"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Sugalvokite PIN (4 skaitmenys)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center tracking-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 transition-colors focus:bg-white"
            />
            <input
              type="password"
              placeholder="Grupės PIN"
              value={leaguePin}
              onChange={(e) => setLeaguePin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 transition-colors focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !name || newPin.length < 4 || !leaguePin}
              className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--color-primary-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Jungiamasi...
                </>
              ) : (
                "Prisijungti prie grupės"
              )}
            </button>
          </form>
        )
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {players.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Dalyvių dar nėra.</p>
          ) : (
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
          )}
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
      )}
    </div>
  );
}

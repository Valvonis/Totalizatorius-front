import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { login, clearError } from "./authSlice";
import api from "../../api/client";
import type { Player } from "../../types";

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
    api.get<Player[]>("/players").then(({ data }) => setPlayers(data));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug || !pin) return;
    dispatch(login({ slug: selectedSlug, pin }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">TOTALIZATORIUS</h1>
        <p className="text-center text-gray-500 text-sm">Pasirinkite savo vardą ir įveskite PIN</p>

        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm text-center">
            {error}
            <button type="button" onClick={() => dispatch(clearError())} className="ml-2 underline cursor-pointer">
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
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                selectedSlug === p.slug
                  ? "bg-[var(--color-primary)] text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-xl tracking-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        <button
          type="submit"
          disabled={loading || !selectedSlug || pin.length < 4}
          className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--color-primary-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? "Jungiamasi..." : "Prisijungti"}
        </button>
      </form>
    </div>
  );
}

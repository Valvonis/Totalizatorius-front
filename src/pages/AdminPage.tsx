import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { createMatch, updateMatch, fetchMatches } from "../features/matches/matchesSlice";
import { fetchActiveTournament, createTournament, setActiveTournament, fetchAllTournaments } from "../features/tournaments/tournamentSlice";
import { useAuth } from "../features/auth/useAuth";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Flag from "../components/Flag";
import { getCountryNames } from "../utils/countries";
import { isMatchStarted, formatMatchTime } from "../utils/date";
import { showToast } from "../components/ui/Toast";
import { Plus, Save, Trophy, Check, X } from "lucide-react";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const allTournaments = useAppSelector((s) => s.tournament.all);
  const matches = useAppSelector((s) => s.matches.items);
  const countries = getCountryNames();

  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [time, setTime] = useState("");

  // Result editing
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  // Tournament creation
  const [tName, setTName] = useState("");
  const [tSlug, setTSlug] = useState("");
  const [tStart, setTStart] = useState("");
  const [tEnd, setTEnd] = useState("");

  useEffect(() => {
    dispatch(fetchActiveTournament());
    dispatch(fetchAllTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (tournament) dispatch(fetchMatches(tournament._id));
  }, [dispatch, tournament]);

  if (!isAdmin) return <Navigate to="/" />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1 || !team2 || !time || !tournament) return;

    try {
      await dispatch(createMatch({ tournamentId: tournament._id, team1, team2, time })).unwrap();
      showToast("Varžybos sukurtos!", "success");
      setTeam1("");
      setTeam2("");
      setTime("");
    } catch {
      showToast("Nepavyko sukurti varžybų", "error");
    }
  };

  const handleSetResult = async (matchId: string) => {
    if (score1 === "" || score2 === "") return;

    try {
      await dispatch(updateMatch({ id: matchId, team1Score: Number(score1), team2Score: Number(score2) })).unwrap();
      showToast("Rezultatas atnaujintas!", "success");
      setEditingMatch(null);
      setScore1("");
      setScore2("");
    } catch {
      showToast("Nepavyko atnaujinti rezultato", "error");
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tSlug || !tStart || !tEnd) return;

    try {
      await dispatch(createTournament({ name: tName, slug: tSlug, startDate: tStart, endDate: tEnd, isActive: true })).unwrap();
      showToast("Turnyras sukurtas ir aktyvuotas!", "success");
      setTName("");
      setTSlug("");
      setTStart("");
      setTEnd("");
    } catch {
      showToast("Nepavyko sukurti turnyro", "error");
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await dispatch(setActiveTournament(id)).unwrap();
      showToast("Turnyras aktyvuotas!", "success");
    } catch {
      showToast("Nepavyko aktyvuoti turnyro", "error");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Tournament Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Turnyrai</h2>

          {/* Existing tournaments */}
          {allTournaments.length > 0 && (
            <div className="flex flex-col gap-2 mb-6">
              {allTournaments.map((t) => (
                <div
                  key={t._id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    t.isActive ? "bg-green-50 ring-2 ring-green-400" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className={t.isActive ? "text-green-600" : "text-gray-400"} />
                    <span className="font-bold text-sm">{t.name}</span>
                    {t.isActive && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktyvus</span>
                    )}
                  </div>
                  {!t.isActive && (
                    <button
                      onClick={() => handleSetActive(t._id)}
                      className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
                    >
                      <Check size={14} />
                      Aktyvuoti
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create new tournament */}
          <form onSubmit={handleCreateTournament} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-600">Naujas turnyras</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Pavadinimas (pvz. World Cup 2026)"
                value={tName}
                onChange={(e) => {
                  setTName(e.target.value);
                  setTSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
              <input
                type="text"
                placeholder="Slug (pvz. wc-2026)"
                value={tSlug}
                onChange={(e) => setTSlug(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Pradžia</label>
                <input
                  type="date"
                  value={tStart}
                  onChange={(e) => setTStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Pabaiga</label>
                <input
                  type="date"
                  value={tEnd}
                  onChange={(e) => setTEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Sukurti ir aktyvuoti
            </button>
          </form>
        </div>

        {/* Create Match Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Sukurti varžybas</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Komanda 1</label>
                <select
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                >
                  <option value="">Pasirinkite...</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Komanda 2</label>
                <select
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                >
                  <option value="">Pasirinkite...</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Laikas</label>
              <input
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer"
            >
              <Plus size={18} />
              Sukurti
            </button>
          </form>
        </div>

        {/* Existing matches — set results */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Varžybų rezultatai</h2>
          <div className="flex flex-col gap-3">
            {matches
              .filter((m) => isMatchStarted(m.time))
              .map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl flex-wrap">
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <Flag countryName={m.team1} size={24} />
                    <span className="text-sm">{m.team1}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-sm">{m.team2}</span>
                    <Flag countryName={m.team2} size={24} />
                  </div>

                  <span className="text-xs text-gray-400">{formatMatchTime(m.time)}</span>

                  {m.team1Score !== null ? (
                    <span className="font-bold">
                      {m.team1Score} - {m.team2Score}
                    </span>
                  ) : editingMatch === m._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={score1}
                        onChange={(e) => setScore1(e.target.value)}
                        className="w-12 px-2 py-1.5 border border-gray-300 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="0"
                      />
                      <span className="text-gray-400 font-bold">:</span>
                      <input
                        type="number"
                        min={0}
                        value={score2}
                        onChange={(e) => setScore2(e.target.value)}
                        className="w-12 px-2 py-1.5 border border-gray-300 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="0"
                      />
                      <button
                        onClick={() => handleSetResult(m._id)}
                        className="p-1.5 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => { setEditingMatch(null); setScore1(""); setScore2(""); }}
                        className="p-1.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingMatch(m._id)}
                      className="text-xs text-[var(--color-primary)] underline cursor-pointer"
                    >
                      Įvesti rezultatą
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

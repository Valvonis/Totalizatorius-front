import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { createMatch, updateMatch, fetchMatches } from "../features/matches/matchesSlice";
import { fetchActiveTournament } from "../features/tournaments/tournamentSlice";
import { useAuth } from "../features/auth/useAuth";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Flag from "../components/Flag";
import { getCountryNames } from "../utils/countries";
import { isMatchStarted, formatMatchTime } from "../utils/date";
import { showToast } from "../components/ui/Toast";
import { Plus, Save } from "lucide-react";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const matches = useAppSelector((s) => s.matches.items);
  const countries = getCountryNames();

  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [time, setTime] = useState("");

  // Result editing
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  useEffect(() => {
    dispatch(fetchActiveTournament());
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

  return (
    <Layout>
      <div className="flex flex-col gap-8">
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
                        className="w-12 px-2 py-1 border rounded text-center"
                        placeholder="0"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        min={0}
                        value={score2}
                        onChange={(e) => setScore2(e.target.value)}
                        className="w-12 px-2 py-1 border rounded text-center"
                        placeholder="0"
                      />
                      <button
                        onClick={() => handleSetResult(m._id)}
                        className="p-1 bg-green-600 text-white rounded cursor-pointer"
                      >
                        <Save size={16} />
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

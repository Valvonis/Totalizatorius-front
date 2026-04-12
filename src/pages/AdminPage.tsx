import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { createMatch, updateMatch, fetchMatches, deleteMatch } from "../features/matches/matchesSlice";
import { fetchActiveTournament, createTournament, setActiveTournament, fetchAllTournaments, updateTournamentLogo, deleteTournament } from "../features/tournaments/tournamentSlice";
import { fetchQuestions, createQuestion, resolveQuestion, updateAnswerPhoto, deleteQuestion } from "../features/questions/questionsSlice";
import { useAuth } from "../features/auth/useAuth";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Flag from "../components/Flag";
import { getCountryNames } from "../utils/countries";
import { isMatchStarted, formatMatchTime, localTimeToISO } from "../utils/date";
import { showToast } from "../components/ui/Toast";
import { Plus, Save, Trophy, Check, X, HelpCircle, Award, Users, Shield, ShieldOff, KeyRound, Trash2, Pencil } from "lucide-react";
import api from "../api/client";
import type { Player } from "../types";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const allTournaments = useAppSelector((s) => s.tournament.all);
  const matches = useAppSelector((s) => s.matches.items);
  const questions = useAppSelector((s) => s.questions.items);
  const countries = getCountryNames();

  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [time, setTime] = useState("");
  const [stage, setStage] = useState("");

  // Result editing
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  // Match detail editing
  const [editingMatchDetails, setEditingMatchDetails] = useState<string | null>(null);
  const [editTeam1, setEditTeam1] = useState("");
  const [editTeam2, setEditTeam2] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editStage, setEditStage] = useState("");

  // Tournament creation
  const [tName, setTName] = useState("");
  const [tSlug, setTSlug] = useState("");
  const [tLogo, setTLogo] = useState("");
  const [tStart, setTStart] = useState("");
  const [tEnd, setTEnd] = useState("");

  // Tournament logo editing
  const [editingLogo, setEditingLogo] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");

  // Question creation
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"country" | "player">("country");
  const [qPoints, setQPoints] = useState("10");

  // Question resolving
  const [resolvingQuestion, setResolvingQuestion] = useState<string | null>(null);
  const [resolveAnswer, setResolveAnswer] = useState("");
  const [resolveImageUrl, setResolveImageUrl] = useState("");

  // Answer photo editing
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  // Player management
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerSlug, setNewPlayerSlug] = useState("");
  const [newPlayerPin, setNewPlayerPin] = useState("");
  const [newPlayerAdmin, setNewPlayerAdmin] = useState(false);
  const [editingPin, setEditingPin] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");

  const fetchPlayers = () => {
    api.get<Player[]>("/players").then(({ data }) => setAllPlayers(data));
  };

  useEffect(() => {
    dispatch(fetchActiveTournament());
    dispatch(fetchAllTournaments());
    fetchPlayers();
  }, [dispatch]);

  useEffect(() => {
    if (tournament) {
      dispatch(fetchMatches(tournament._id));
      dispatch(fetchQuestions(tournament._id));
    }
  }, [dispatch, tournament]);

  if (!isAdmin) return <Navigate to="/" />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1 || !team2 || !time || !tournament) return;
    if (team1 === team2) {
      showToast("Komandos negali būti vienodos!", "error");
      return;
    }

    try {
      await dispatch(createMatch({ tournamentId: tournament._id, team1, team2, time: localTimeToISO(time), stage: stage || undefined })).unwrap();
      showToast("Varžybos sukurtos!", "success");
      setTeam1("");
      setTeam2("");
      setTime("");
      setStage("");
    } catch {
      showToast("Nepavyko sukurti varžybų", "error");
    }
  };

  const handleSetResult = async (matchId: string) => {
    if (score1 === "" || score2 === "") return;
    if (!window.confirm(`Ar tikrai norite įvesti rezultatą ${score1}:${score2}? Bus perskaičiuoti visi taškai.`)) return;

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

  const startEditingMatchDetails = (m: typeof matches[0]) => {
    setEditingMatchDetails(m._id);
    setEditTeam1(m.team1);
    setEditTeam2(m.team2);
    setEditTime(m.time.slice(0, 16)); // datetime-local format
    setEditStage(m.stage || "");
  };

  const handleSaveMatchDetails = async (matchId: string) => {
    if (!editTeam1 || !editTeam2 || !editTime) return;
    if (editTeam1 === editTeam2) {
      showToast("Komandos negali būti vienodos!", "error");
      return;
    }

    try {
      await dispatch(updateMatch({ id: matchId, team1: editTeam1, team2: editTeam2, time: localTimeToISO(editTime), stage: editStage || undefined })).unwrap();
      showToast("Varžybos atnaujintos!", "success");
      setEditingMatchDetails(null);
    } catch {
      showToast("Nepavyko atnaujinti varžybų", "error");
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tSlug || !tStart || !tEnd) return;

    try {
      await dispatch(createTournament({ name: tName, slug: tSlug, logoUrl: tLogo || undefined, startDate: tStart, endDate: tEnd, isActive: true })).unwrap();
      showToast("Turnyras sukurtas ir aktyvuotas!", "success");
      setTName("");
      setTSlug("");
      setTLogo("");
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

  const handleUpdateLogo = async (id: string) => {
    if (!logoUrl) return;
    try {
      await dispatch(updateTournamentLogo({ id, logoUrl })).unwrap();
      showToast("Logotipas atnaujintas!", "success");
      setEditingLogo(null);
      setLogoUrl("");
    } catch {
      showToast("Nepavyko atnaujinti logotipo", "error");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !tournament) return;

    try {
      await dispatch(createQuestion({
        tournamentId: tournament._id,
        question: qText,
        type: qType,
        pointValue: Number(qPoints) || 10,
      })).unwrap();
      showToast("Klausimas sukurtas!", "success");
      setQText("");
      setQPoints("10");
    } catch {
      showToast("Nepavyko sukurti klausimo", "error");
    }
  };

  const handleUpdatePhoto = async (answerId: string) => {
    if (!photoUrl) return;
    try {
      await dispatch(updateAnswerPhoto({ answerId, imageUrl: photoUrl })).unwrap();
      showToast("Nuotrauka atnaujinta!", "success");
      setEditingPhoto(null);
      setPhotoUrl("");
      if (tournament) dispatch(fetchQuestions(tournament._id));
    } catch {
      showToast("Nepavyko atnaujinti nuotraukos", "error");
    }
  };

  const handleResolveQuestion = async (questionId: string) => {
    if (!resolveAnswer) return;
    if (!window.confirm(`Ar tikrai norite patvirtinti atsakymą "${resolveAnswer}"? Bus paskaičiuoti taškai.`)) return;

    try {
      await dispatch(resolveQuestion({
        id: questionId,
        correctAnswer: resolveAnswer,
        answerImageUrl: resolveImageUrl || undefined,
      })).unwrap();
      showToast("Klausimas išspręstas!", "success");
      setResolvingQuestion(null);
      setResolveAnswer("");
      setResolveImageUrl("");
      if (tournament) dispatch(fetchQuestions(tournament._id));
    } catch {
      showToast("Nepavyko išspręsti klausimo", "error");
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName || !newPlayerSlug || !newPlayerPin) return;

    try {
      await api.post("/players", { name: newPlayerName, slug: newPlayerSlug, pin: newPlayerPin, isAdmin: newPlayerAdmin });
      showToast("Žaidėjas sukurtas!", "success");
      setNewPlayerName("");
      setNewPlayerSlug("");
      setNewPlayerPin("");
      setNewPlayerAdmin(false);
      fetchPlayers();
    } catch {
      showToast("Nepavyko sukurti žaidėjo", "error");
    }
  };

  const handleToggleAdmin = async (playerId: string, currentAdmin: boolean) => {
    try {
      await api.patch(`/players/${playerId}`, { isAdmin: !currentAdmin });
      showToast(!currentAdmin ? "Administratorius pridėtas" : "Administratorius pašalintas", "success");
      fetchPlayers();
    } catch {
      showToast("Nepavyko atnaujinti", "error");
    }
  };

  const handleChangePin = async (playerId: string) => {
    if (!newPin || newPin.length < 4) return;
    try {
      await api.patch(`/players/${playerId}`, { pin: newPin });
      showToast("PIN pakeistas!", "success");
      setEditingPin(null);
      setNewPin("");
    } catch {
      showToast("Nepavyko pakeisti PIN", "error");
    }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!window.confirm(`Ar tikrai norite ištrinti žaidėją "${playerName}"?`)) return;
    try {
      await api.delete(`/players/${playerId}`);
      showToast("Žaidėjas ištrintas", "success");
      fetchPlayers();
    } catch {
      showToast("Nepavyko ištrinti žaidėjo", "error");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!window.confirm("Ar tikrai norite ištrinti šias varžybas ir visus spėjimus?")) return;
    try {
      await dispatch(deleteMatch(matchId)).unwrap();
      showToast("Varžybos ištrintos", "success");
    } catch {
      showToast("Nepavyko ištrinti varžybų", "error");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm("Ar tikrai norite ištrinti šį klausimą ir visus atsakymus?")) return;
    try {
      await dispatch(deleteQuestion(questionId)).unwrap();
      showToast("Klausimas ištrintas", "success");
    } catch {
      showToast("Nepavyko ištrinti klausimo", "error");
    }
  };

  const handleDeleteTournament = async (tournamentId: string, name: string) => {
    if (!window.confirm(`Ar tikrai norite ištrinti turnyrą "${name}"?`)) return;
    try {
      await dispatch(deleteTournament(tournamentId)).unwrap();
      showToast("Turnyras ištrintas", "success");
    } catch (err) {
      showToast(String(err), "error");
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
                  className={`flex flex-col gap-2 p-3 rounded-xl ${
                    t.isActive ? "bg-green-50 ring-2 ring-green-400" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {t.logoUrl ? (
                        <img src={t.logoUrl} alt={t.name} className="h-6 w-6 object-contain" />
                      ) : (
                        <Trophy size={16} className={t.isActive ? "text-green-600" : "text-gray-400"} />
                      )}
                      <span className="font-bold text-sm">{t.name}</span>
                      {t.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktyvus</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingLogo !== t._id && (
                        <button
                          onClick={() => { setEditingLogo(t._id); setLogoUrl(t.logoUrl || ""); }}
                          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {t.logoUrl ? "Keisti logo" : "Pridėti logo"}
                        </button>
                      )}
                      {!t.isActive && (
                        <>
                          <button
                            onClick={() => handleSetActive(t._id)}
                            className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
                          >
                            <Check size={14} />
                            Aktyvuoti
                          </button>
                          <button
                            onClick={() => handleDeleteTournament(t._id, t.name)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                            title="Ištrinti turnyrą"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingLogo === t._id && (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Logo URL (https://...)"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <button
                        onClick={() => handleUpdateLogo(t._id)}
                        className="p-1.5 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => { setEditingLogo(null); setLogoUrl(""); }}
                        className="p-1.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      {logoUrl && (
                        <img src={logoUrl} alt="Preview" className="h-6 w-6 object-contain" />
                      )}
                    </div>
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
            <input
              type="url"
              placeholder="Logo URL (https://... — neprivaloma)"
              value={tLogo}
              onChange={(e) => setTLogo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
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

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm text-gray-600 mb-1">Etapas (neprivaloma)</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Nepasirinkta</option>
                  <option value="Grupė A">Grupė A</option>
                  <option value="Grupė B">Grupė B</option>
                  <option value="Grupė C">Grupė C</option>
                  <option value="Grupė D">Grupė D</option>
                  <option value="Grupė E">Grupė E</option>
                  <option value="Grupė F">Grupė F</option>
                  <option value="Grupė G">Grupė G</option>
                  <option value="Grupė H">Grupė H</option>
                  <option value="Grupė I">Grupė I</option>
                  <option value="Grupė J">Grupė J</option>
                  <option value="Grupė K">Grupė K</option>
                  <option value="Grupė L">Grupė L</option>
                  <option value="Šešioliktfinalis">Šešioliktfinalis</option>
                  <option value="Aštuntfinalis">Aštuntfinalis</option>
                  <option value="Ketvirtfinalis">Ketvirtfinalis</option>
                  <option value="Pusfinalis">Pusfinalis</option>
                  <option value="Finalas">Finalas</option>
                  <option value="3 vietos rungtynės">3 vietos rungtynės</option>
                </select>
              </div>
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

        {/* Special Questions Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle size={22} />
            Specialūs klausimai
          </h2>

          {/* Existing questions */}
          {questions.length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              {questions.map((q) => (
                <div
                  key={q._id}
                  className={`p-4 rounded-xl ${q.isResolved ? "bg-green-50 ring-1 ring-green-300" : "bg-gray-50"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.type === "country" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {q.type === "country" ? "Šalis" : "Žaidėjas"}
                      </span>
                      <span className="font-bold text-sm">{q.question}</span>
                      <span className="text-xs text-[var(--color-accent)] font-bold">+{q.pointValue}</span>
                    </div>
                    {q.isResolved && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check size={12} />
                        {q.correctAnswer}
                      </span>
                    )}
                  </div>

                  {/* Answers from players */}
                  {q.answers.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {q.answers.map((a) => (
                        <div key={a._id} className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg text-xs border border-gray-200">
                            {a.additionalData?.imageUrl && (
                              <img src={a.additionalData.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                            )}
                            <span className="text-gray-400">{a.playerId.name}:</span>
                            {q.type === "country" && <Flag countryName={a.answer} size={16} />}
                            <span className="font-medium">{a.answer}</span>
                            {a.points !== null && (
                              <span className={`font-bold ${a.points > 0 ? "text-green-600" : "text-gray-400"}`}>+{a.points}</span>
                            )}
                            {q.type === "player" && (
                              <button
                                onClick={() => { setEditingPhoto(a._id); setPhotoUrl(a.additionalData?.imageUrl || ""); }}
                                className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                {a.additionalData?.imageUrl ? "Keisti foto" : "Pridėti foto"}
                              </button>
                            )}
                          </div>
                          {editingPhoto === a._id && (
                            <div className="flex items-center gap-2 ml-4">
                              <input
                                type="url"
                                placeholder="Žaidėjo nuotraukos URL (https://...)"
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                              />
                              <button
                                onClick={() => handleUpdatePhoto(a._id)}
                                className="p-1.5 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                              >
                                <Save size={12} />
                              </button>
                              <button
                                onClick={() => { setEditingPhoto(null); setPhotoUrl(""); }}
                                className="p-1.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
                              >
                                <X size={12} />
                              </button>
                              {photoUrl && (
                                <img src={photoUrl} alt="Preview" className="w-6 h-6 rounded-full object-cover" />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resolve button */}
                  {!q.isResolved && (
                    resolvingQuestion === q._id ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          {q.type === "country" ? (
                            <select
                              value={resolveAnswer}
                              onChange={(e) => setResolveAnswer(e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                              <option value="">Teisingas atsakymas...</option>
                              {countries.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="Teisingas atsakymas (žaidėjo vardas)"
                              value={resolveAnswer}
                              onChange={(e) => setResolveAnswer(e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                          )}
                          <button
                            onClick={() => handleResolveQuestion(q._id)}
                            className="p-1.5 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setResolvingQuestion(null); setResolveAnswer(""); setResolveImageUrl(""); }}
                            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {q.type === "player" && (
                          <input
                            type="url"
                            placeholder="Žaidėjo nuotraukos URL (neprivaloma)"
                            value={resolveImageUrl}
                            onChange={(e) => setResolveImageUrl(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          onClick={() => setResolvingQuestion(q._id)}
                          className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
                        >
                          <Award size={13} />
                          Išspręsti klausimą
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          Ištrinti
                        </button>
                      </div>
                    )
                  )}
                  {/* Delete resolved question */}
                  {q.isResolved && (
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 cursor-pointer mt-1"
                    >
                      <Trash2 size={13} />
                      Ištrinti klausimą
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create new question */}
          <form onSubmit={handleCreateQuestion} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-600">Naujas klausimas</h3>
            <input
              type="text"
              placeholder="Klausimo tekstas (pvz. Kas laimės turnyrą?)"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipas</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as "country" | "player")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="country">Šalis (renkamasi iš sąrašo su vėliavomis)</option>
                  <option value="player">Žaidėjas (įvedamas vardas)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Taškai</label>
                <input
                  type="number"
                  min={1}
                  value={qPoints}
                  onChange={(e) => setQPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Sukurti klausimą
            </button>
          </form>
        </div>

        {/* All matches — edit details & set results */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Visos varžybos</h2>
          <div className="flex flex-col gap-3">
            {matches.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Varžybų dar nėra.</p>
            )}
            {matches.map((m) => {
              const started = isMatchStarted(m.time);
              return (
                <div key={m._id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
                  {editingMatchDetails === m._id ? (
                    /* Edit mode */
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editTeam1}
                          onChange={(e) => setEditTeam1(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <select
                          value={editTeam2}
                          onChange={(e) => setEditTeam2(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="datetime-local"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                        <select
                          value={editStage}
                          onChange={(e) => setEditStage(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                          <option value="">Nepasirinkta</option>
                          <option value="Grupė A">Grupė A</option>
                          <option value="Grupė B">Grupė B</option>
                          <option value="Grupė C">Grupė C</option>
                          <option value="Grupė D">Grupė D</option>
                          <option value="Grupė E">Grupė E</option>
                          <option value="Grupė F">Grupė F</option>
                          <option value="Grupė G">Grupė G</option>
                          <option value="Grupė H">Grupė H</option>
                          <option value="Grupė I">Grupė I</option>
                          <option value="Grupė J">Grupė J</option>
                          <option value="Grupė K">Grupė K</option>
                          <option value="Grupė L">Grupė L</option>
                          <option value="Šešioliktfinalis">Šešioliktfinalis</option>
                  <option value="Aštuntfinalis">Aštuntfinalis</option>
                          <option value="Ketvirtfinalis">Ketvirtfinalis</option>
                          <option value="Pusfinalis">Pusfinalis</option>
                          <option value="Finalas">Finalas</option>
                          <option value="3 vietos rungtynės">3 vietos rungtynės</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveMatchDetails(m._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-green-700 transition-colors"
                        >
                          <Save size={12} />
                          Išsaugoti
                        </button>
                        <button
                          onClick={() => setEditingMatchDetails(null)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-300 transition-colors"
                        >
                          Atšaukti
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Flag countryName={m.team1} size={24} />
                        <span className="text-sm font-medium">{m.team1}</span>
                        <span className="text-gray-300">vs</span>
                        <span className="text-sm font-medium">{m.team2}</span>
                        <Flag countryName={m.team2} size={24} />
                      </div>
                      <span className="text-xs text-gray-400">{formatMatchTime(m.time)}</span>
                      {m.stage && (
                        <span className="text-[10px] font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded">
                          {m.stage}
                        </span>
                      )}
                      {m.team1Score !== null && (
                        <span className="font-bold text-sm">{m.team1Score} - {m.team2Score}</span>
                      )}
                      {!started && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Būsimos</span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => startEditingMatchDetails(m)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                          title="Redaguoti varžybas"
                        >
                          <Pencil size={14} />
                        </button>
                        {started && m.team1Score === null && editingMatch !== m._id && (
                          <button
                            onClick={() => setEditingMatch(m._id)}
                            className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer px-1"
                          >
                            Įvesti rezultatą
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMatch(m._id)}
                          className="p-1.5 text-gray-300 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                          title="Ištrinti varžybas"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline result entry */}
                  {editingMatch === m._id && editingMatchDetails !== m._id && (
                    <div className="flex items-center gap-2 border-t border-gray-200 pt-2">
                      <span className="text-xs text-gray-400">Rezultatas:</span>
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
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={22} />
            Žaidėjai
          </h2>

          {/* Existing players */}
          {allPlayers.length > 0 && (
            <div className="flex flex-col gap-2 mb-6">
              {allPlayers.map((p) => {
                const pid = p._id || p.id || "";
                return (
                  <div key={pid} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{p.name}</span>
                        <span className="text-xs text-gray-400">({p.slug})</span>
                        {p.isAdmin && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <Shield size={10} />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAdmin(pid, p.isAdmin)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                          title={p.isAdmin ? "Pašalinti admin teises" : "Suteikti admin teises"}
                        >
                          {p.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                        </button>
                        <button
                          onClick={() => { setEditingPin(pid); setNewPin(""); }}
                          className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                          title="Keisti PIN"
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(pid, p.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                          title="Ištrinti žaidėją"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* PIN change inline form */}
                    {editingPin === pid && (
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="Naujas PIN (4 skaitmenys)"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-sm text-center tracking-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                        <button
                          onClick={() => handleChangePin(pid)}
                          disabled={newPin.length < 4}
                          className="p-1.5 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-40"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => { setEditingPin(null); setNewPin(""); }}
                          className="p-1.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Create new player */}
          <form onSubmit={handleCreatePlayer} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-600">Naujas žaidėjas</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Vardas"
                value={newPlayerName}
                onChange={(e) => {
                  setNewPlayerName(e.target.value);
                  setNewPlayerSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
              <input
                type="text"
                placeholder="Slug (pvz. vardas)"
                value={newPlayerSlug}
                onChange={(e) => setNewPlayerSlug(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="PIN (4 skaitmenys)"
                value={newPlayerPin}
                onChange={(e) => setNewPlayerPin(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm text-center tracking-[8px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
              <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPlayerAdmin}
                  onChange={(e) => setNewPlayerAdmin(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                Administratorius
              </label>
            </div>
            <button
              type="submit"
              disabled={!newPlayerName || !newPlayerSlug || newPlayerPin.length < 4}
              className="flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer disabled:opacity-40"
            >
              <Plus size={16} />
              Pridėti žaidėją
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

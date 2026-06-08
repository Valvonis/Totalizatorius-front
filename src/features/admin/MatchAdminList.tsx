import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { updateMatch, deleteMatch } from "../matches/matchesSlice";
import { ALL_STAGES } from "../matches/stages";
import { getCountryNames } from "../../utils/countries";
import { isMatchStarted, formatMatchTime, localTimeToISO } from "../../utils/date";
import { showToast } from "../../components/ui/Toast";
import { showConfirm } from "../../components/ui/ConfirmDialog";
import Flag from "../../components/Flag";
import FormInput from "../../components/ui/FormInput";
import FormSelect from "../../components/ui/FormSelect";
import InlineSaveCancel from "./InlineSaveCancel";
import { Save, Pencil, Trash2 } from "lucide-react";
import type { Match } from "../../types";

export default function MatchAdminList() {
  const dispatch = useAppDispatch();
  const matches = useAppSelector((s) => s.matches.items);
  const countries = getCountryNames();

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

  const handleSetResult = async (matchId: string) => {
    if (score1 === "" || score2 === "") return;
    if (!(await showConfirm({
      title: "Įvesti rezultatą",
      message: `Ar tikrai norite įvesti rezultatą ${score1}:${score2}? Bus perskaičiuoti visi taškai.`,
      confirmText: "Įvesti",
      variant: "primary",
    }))) return;

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

  const startEditingMatchDetails = (m: Match) => {
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

  const handleDeleteMatch = async (matchId: string) => {
    if (!(await showConfirm({
      title: "Ištrinti varžybas",
      message: "Ar tikrai norite ištrinti šias varžybas ir visus spėjimus?",
      confirmText: "Ištrinti",
      variant: "danger",
    }))) return;
    try {
      await dispatch(deleteMatch(matchId)).unwrap();
      showToast("Varžybos ištrintos", "success");
    } catch {
      showToast("Nepavyko ištrinti varžybų", "error");
    }
  };

  return (
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
                    <FormSelect value={editTeam1} onChange={(e) => setEditTeam1(e.target.value)} compact>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </FormSelect>
                    <FormSelect value={editTeam2} onChange={(e) => setEditTeam2(e.target.value)} compact>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormInput type="datetime-local" value={editTime} onChange={(e) => setEditTime(e.target.value)} compact />
                    <FormSelect value={editStage} onChange={(e) => setEditStage(e.target.value)} compact>
                      <option value="">Nepasirinkta</option>
                      {ALL_STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </FormSelect>
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
                  <InlineSaveCancel
                    onSave={() => handleSetResult(m._id)}
                    onCancel={() => { setEditingMatch(null); setScore1(""); setScore2(""); }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { createTournament, setActiveTournament, updateTournamentLogo, deleteTournament } from "../tournaments/tournamentSlice";
import { slugify } from "../../utils/slug";
import { showToast } from "../../components/ui/Toast";
import { showConfirm } from "../../components/ui/ConfirmDialog";
import FormInput from "../../components/ui/FormInput";
import InlineSaveCancel from "./InlineSaveCancel";
import { Plus, Trophy, Check, Trash2 } from "lucide-react";

export default function TournamentManager() {
  const dispatch = useAppDispatch();
  const allTournaments = useAppSelector((s) => s.tournament.all);

  // Tournament creation
  const [tName, setTName] = useState("");
  const [tSlug, setTSlug] = useState("");
  const [tLogo, setTLogo] = useState("");
  const [tStart, setTStart] = useState("");
  const [tEnd, setTEnd] = useState("");

  // Tournament logo editing
  const [editingLogo, setEditingLogo] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");

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

  const handleDeleteTournament = async (tournamentId: string, name: string) => {
    if (!(await showConfirm({
      title: "Ištrinti turnyrą",
      message: `Ar tikrai norite ištrinti turnyrą "${name}"?`,
      confirmText: "Ištrinti",
      variant: "danger",
    }))) return;
    try {
      await dispatch(deleteTournament(tournamentId)).unwrap();
      showToast("Turnyras ištrintas", "success");
    } catch (err) {
      showToast(String(err), "error");
    }
  };

  return (
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
                  <FormInput
                    type="url"
                    placeholder="Logo URL (https://...)"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    compact
                    className="flex-1"
                  />
                  <InlineSaveCancel
                    onSave={() => handleUpdateLogo(t._id)}
                    onCancel={() => { setEditingLogo(null); setLogoUrl(""); }}
                  />
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
          <FormInput
            type="text"
            placeholder="Pavadinimas (pvz. World Cup 2026)"
            value={tName}
            onChange={(e) => {
              setTName(e.target.value);
              setTSlug(slugify(e.target.value));
            }}
            required
          />
          <FormInput
            type="text"
            placeholder="Slug (pvz. wc-2026)"
            value={tSlug}
            onChange={(e) => setTSlug(e.target.value)}
            required
          />
        </div>
        <FormInput
          type="url"
          placeholder="Logo URL (https://... — neprivaloma)"
          value={tLogo}
          onChange={(e) => setTLogo(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Pradžia" type="date" value={tStart} onChange={(e) => setTStart(e.target.value)} required />
          <FormInput label="Pabaiga" type="date" value={tEnd} onChange={(e) => setTEnd(e.target.value)} required />
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
  );
}

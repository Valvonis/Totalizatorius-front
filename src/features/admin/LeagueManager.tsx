import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { createLeague, updateLeague, deleteLeague } from "../leagues/leagueSlice";
import { slugify } from "../../utils/slug";
import { showToast } from "../../components/ui/Toast";
import { showConfirm } from "../../components/ui/ConfirmDialog";
import FormInput from "../../components/ui/FormInput";
import FormSelect from "../../components/ui/FormSelect";
import InlineSaveCancel from "./InlineSaveCancel";
import { Plus, Users, Trash2, Copy, KeyRound } from "lucide-react";

export default function LeagueManager() {
  const dispatch = useAppDispatch();
  const leagues = useAppSelector((s) => s.leagues.all);
  const tournaments = useAppSelector((s) => s.tournament.all);
  const activeTournament = useAppSelector((s) => s.tournament.active);

  const [lName, setLName] = useState("");
  const [lSlug, setLSlug] = useState("");
  const [lTournamentId, setLTournamentId] = useState("");
  const [lJoinPin, setLJoinPin] = useState("");
  const [lLogo, setLLogo] = useState("");

  const [editingPin, setEditingPin] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState("");

  // Default the championship to the active one (derived — no effect needed).
  const selectedTournamentId = lTournamentId || activeTournament?._id || "";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lName || !lSlug || !selectedTournamentId || !lJoinPin) return;
    try {
      await dispatch(
        createLeague({ name: lName, slug: lSlug, tournamentId: selectedTournamentId, joinPin: lJoinPin, logoUrl: lLogo || undefined })
      ).unwrap();
      showToast("Grupė sukurta!", "success");
      setLName("");
      setLSlug("");
      setLJoinPin("");
      setLLogo("");
    } catch (err) {
      showToast(String(err), "error");
    }
  };

  const handleSetPin = async (id: string) => {
    if (!pinValue) return;
    try {
      await dispatch(updateLeague({ id, joinPin: pinValue })).unwrap();
      showToast("Grupės PIN atnaujintas!", "success");
      setEditingPin(null);
      setPinValue("");
    } catch {
      showToast("Nepavyko atnaujinti PIN", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !(await showConfirm({
        title: "Ištrinti grupę",
        message: `Ar tikrai norite ištrinti grupę "${name}" ir VISUS jos narius, spėjimus bei klausimus? Šio veiksmo atšaukti negalima.`,
        confirmText: "Ištrinti",
        variant: "danger",
      }))
    )
      return;
    try {
      await dispatch(deleteLeague(id)).unwrap();
      showToast("Grupė ištrinta", "success");
    } catch (err) {
      showToast(String(err), "error");
    }
  };

  const copyJoinLink = (slug: string) => {
    const url = `${window.location.origin}/join/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => showToast("Nuoroda nukopijuota!", "success"),
        () => {}
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users size={22} />
        Grupės
      </h2>

      {/* Existing leagues */}
      {leagues.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {leagues.map((l) => (
            <div key={l._id} className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {l.logoUrl ? (
                    <img src={l.logoUrl} alt={l.name} className="h-6 w-6 object-contain shrink-0" />
                  ) : (
                    <Users size={16} className="text-gray-400 shrink-0" />
                  )}
                  <span className="font-bold text-sm truncate">{l.name}</span>
                  <span className="text-xs text-gray-400">({l.memberCount ?? 0}/50)</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyJoinLink(l.slug)}
                    className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
                    title="Kopijuoti prisijungimo nuorodą"
                  >
                    <Copy size={13} />
                    Nuoroda
                  </button>
                  <button
                    onClick={() => { setEditingPin(l._id); setPinValue(""); }}
                    className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                    title="Keisti grupės PIN"
                  >
                    <KeyRound size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(l._id, l.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                    title="Ištrinti grupę"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 font-mono break-all">
                {window.location.origin}/join/{l.slug}
              </div>

              {editingPin === l._id && (
                <div className="flex items-center gap-2">
                  <FormInput
                    type="text"
                    placeholder="Naujas grupės PIN"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    compact
                    className="flex-1"
                  />
                  <InlineSaveCancel
                    onSave={() => handleSetPin(l._id)}
                    onCancel={() => { setEditingPin(null); setPinValue(""); }}
                    saveDisabled={!pinValue}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create new league */}
      <form onSubmit={handleCreate} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold text-gray-600">Nauja grupė</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            type="text"
            placeholder="Pavadinimas (pvz. Didžioji grupė)"
            value={lName}
            onChange={(e) => {
              setLName(e.target.value);
              setLSlug(slugify(e.target.value));
            }}
            required
          />
          <FormInput
            type="text"
            placeholder="Slug (pvz. didzioji)"
            value={lSlug}
            onChange={(e) => setLSlug(e.target.value)}
            required
          />
        </div>
        <FormSelect label="Čempionatas" value={selectedTournamentId} onChange={(e) => setLTournamentId(e.target.value)}>
          <option value="">Pasirinkite čempionatą...</option>
          {tournaments.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </FormSelect>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Grupės PIN"
            type="text"
            placeholder="Bendras prisijungimo PIN"
            value={lJoinPin}
            onChange={(e) => setLJoinPin(e.target.value)}
            required
          />
          <FormInput
            label="Logo URL (neprivaloma)"
            type="url"
            placeholder="https://..."
            value={lLogo}
            onChange={(e) => setLLogo(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={!lName || !lSlug || !selectedTournamentId || !lJoinPin}
          className="flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer disabled:opacity-40"
        >
          <Plus size={16} />
          Sukurti grupę
        </button>
      </form>
    </div>
  );
}

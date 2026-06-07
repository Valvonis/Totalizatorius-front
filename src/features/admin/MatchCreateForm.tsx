import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { createMatch } from "../matches/matchesSlice";
import { ALL_STAGES } from "../matches/stages";
import { getCountryNames } from "../../utils/countries";
import { localTimeToISO } from "../../utils/date";
import { showToast } from "../../components/ui/Toast";
import FormInput from "../../components/ui/FormInput";
import FormSelect from "../../components/ui/FormSelect";
import { Plus } from "lucide-react";

export default function MatchCreateForm() {
  const dispatch = useAppDispatch();
  const tournament = useAppSelector((s) => s.tournament.active);
  const countries = getCountryNames();

  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [time, setTime] = useState("");
  const [stage, setStage] = useState("");

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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Sukurti varžybas</h2>
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Komanda 1" value={team1} onChange={(e) => setTeam1(e.target.value)} required>
            <option value="">Pasirinkite...</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FormSelect>
          <FormSelect label="Komanda 2" value={team2} onChange={(e) => setTeam2(e.target.value)} required>
            <option value="">Pasirinkite...</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </FormSelect>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Laikas" type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} required />
          <FormSelect label="Etapas (neprivaloma)" value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">Nepasirinkta</option>
            {ALL_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FormSelect>
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
  );
}

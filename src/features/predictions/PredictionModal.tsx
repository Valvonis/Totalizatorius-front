import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { submitPrediction } from "./predictionsSlice";
import { fetchMatches } from "../matches/matchesSlice";
import { fetchLeaderboard } from "../scoreboard/scoreboardSlice";
import Modal from "../../components/ui/Modal";
import GoalSlider from "../../components/ui/GoalSlider";
import Flag from "../../components/Flag";
import { showToast } from "../../components/ui/Toast";
import { Loader2, Info, ChevronDown, ChevronUp, Target, TrendingUp, Trophy, XCircle } from "lucide-react";

interface PredictionModalProps {
  matchId: string | null;
  onClose: () => void;
}

export default function PredictionModal({ matchId, onClose }: PredictionModalProps) {
  const dispatch = useAppDispatch();
  const match = useAppSelector((s) =>
    s.matches.items.find((m) => m._id === matchId)
  );
  const { loading } = useAppSelector((s) => s.predictions);
  const tournament = useAppSelector((s) => s.tournament.active);

  const [team1Goal, setTeam1Goal] = useState(0);
  const [team2Goal, setTeam2Goal] = useState(0);
  const [showRules, setShowRules] = useState(false);

  if (!match) return null;

  const handleSubmit = async () => {
    try {
      await dispatch(submitPrediction({ matchId: match._id, team1Goal, team2Goal })).unwrap();
      showToast("Spėjimas pateiktas!", "success");
      dispatch(fetchMatches({ tournamentId: tournament?._id }));
      dispatch(fetchLeaderboard({ tournamentId: tournament?._id }));
      onClose();
      setTeam1Goal(0);
      setTeam2Goal(0);
    } catch (err) {
      showToast(String(err), "error");
    }
  };

  return (
    <Modal open={!!matchId} onClose={onClose} title="Jūsų spėjimas">
      <div className="flex flex-col gap-6">
        {/* Match info */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <Flag countryName={match.team1} size={48} />
            <span className="text-xs mt-1">{match.team1}</span>
          </div>
          <span className="text-gray-400 font-bold">vs</span>
          <div className="flex flex-col items-center">
            <Flag countryName={match.team2} size={48} />
            <span className="text-xs mt-1">{match.team2}</span>
          </div>
        </div>

        {/* Goal sliders */}
        <GoalSlider label={match.team1} value={team1Goal} onChange={setTeam1Goal} />
        <GoalSlider label={match.team2} value={team2Goal} onChange={setTeam2Goal} />

        {/* Preview */}
        <div className="text-center py-3 bg-gray-50 rounded-xl">
          <span className="text-3xl font-bold text-gray-800">{team1Goal} : {team2Goal}</span>
        </div>

        {/* Scoring rules */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Info size={13} />
              Kaip skaičiuojami taškai?
            </span>
            {showRules ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showRules && (
            <div className="px-3 pb-3 flex flex-col gap-1.5 text-xs animate-fade-in">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-2.5 py-1.5">
                <Target size={14} className="shrink-0" />
                <span><strong>5 taškai</strong> — tikslus rezultatas (pvz. spėjote 2:1, buvo 2:1)</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 rounded-lg px-2.5 py-1.5">
                <TrendingUp size={14} className="shrink-0" />
                <span><strong>3 taškai</strong> — teisingas skirtumas (pvz. spėjote 3:1, buvo 2:0)</span>
              </div>
              <div className="flex items-center gap-2 text-orange-700 bg-orange-50 rounded-lg px-2.5 py-1.5">
                <Trophy size={14} className="shrink-0" />
                <span><strong>1 taškas</strong> — teisingas nugalėtojas (pvz. spėjote 3:0, buvo 1:0)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <XCircle size={14} className="shrink-0" />
                <span><strong>0 taškų</strong> — neteisingas spėjimas</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Pateikiama...
            </>
          ) : (
            "Pateikti spėjimą"
          )}
        </button>
      </div>
    </Modal>
  );
}

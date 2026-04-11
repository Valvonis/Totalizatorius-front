import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { submitPrediction } from "./predictionsSlice";
import { fetchMatches } from "../matches/matchesSlice";
import { fetchLeaderboard } from "../scoreboard/scoreboardSlice";
import Modal from "../../components/ui/Modal";
import GoalSlider from "../../components/ui/GoalSlider";
import Flag from "../../components/Flag";
import { showToast } from "../../components/ui/Toast";

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

  if (!match) return null;

  const handleSubmit = async () => {
    try {
      await dispatch(submitPrediction({ matchId: match._id, team1Goal, team2Goal })).unwrap();
      showToast("Spėjimas pateiktas!", "success");
      dispatch(fetchMatches(tournament?._id));
      dispatch(fetchLeaderboard(tournament?._id));
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
            <Flag countryName={match.team1} size={40} />
            <span className="text-xs mt-1">{match.team1}</span>
          </div>
          <span className="text-gray-400 font-bold">vs</span>
          <div className="flex flex-col items-center">
            <Flag countryName={match.team2} size={40} />
            <span className="text-xs mt-1">{match.team2}</span>
          </div>
        </div>

        {/* Goal sliders */}
        <GoalSlider label={match.team1} value={team1Goal} onChange={setTeam1Goal} />
        <GoalSlider label={match.team2} value={team2Goal} onChange={setTeam2Goal} />

        {/* Preview */}
        <div className="text-center text-2xl font-bold text-gray-800">
          {team1Goal} : {team2Goal}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? "Pateikiama..." : "Pateikti spėjimą"}
        </button>
      </div>
    </Modal>
  );
}

import { useMemo } from "react";
import { useAppSelector } from "../../hooks";
import { useAuth } from "../auth/useAuth";
import { isMatchStarted, getMatchUrgency, getCountdown } from "../../utils/date";
import Flag from "../../components/Flag";
import { AlertCircle, Clock, Zap } from "lucide-react";

interface PredictionNudgeProps {
  onPredict: (matchId: string) => void;
}

// Surfaces upcoming matches the current player hasn't predicted yet, prioritising
// the ones about to kick off. Renders nothing when everything is predicted.
export default function PredictionNudge({ onPredict }: PredictionNudgeProps) {
  const matches = useAppSelector((s) => s.matches.items);
  const { player } = useAuth();

  const { unpredicted, urgent } = useMemo(() => {
    const unpredicted = matches
      .filter((m) => !isMatchStarted(m.time) && !m.predictions.some((p) => p.playerId === player?.id))
      .sort((a, b) => a.time.localeCompare(b.time));
    const urgent = unpredicted.filter((m) => {
      const u = getMatchUrgency(m.time);
      return u === "urgent" || u === "soon";
    });
    return { unpredicted, urgent };
  }, [matches, player]);

  const next = unpredicted[0];
  if (!next) return null;

  // At least one unpredicted match kicks off within ~3h — push hard.
  if (urgent.length > 0) {
    const soonest = urgent[0];
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-red-500/15 border border-red-500/25 animate-fade-up">
        <Zap size={18} className="shrink-0 text-red-400" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-red-200 flex items-center gap-1.5 flex-wrap">
            <Flag countryName={soonest.team1} size={16} />
            <span>{soonest.team1}</span>
            <span className="text-red-300/50">–</span>
            <span>{soonest.team2}</span>
            <Flag countryName={soonest.team2} size={16} />
            <span className="flex items-center gap-1 text-red-300/90">
              <Clock size={12} /> už {getCountdown(soonest.time)}
            </span>
          </div>
          <div className="text-xs text-red-300/70 mt-0.5">
            {urgent.length === 1 ? "Nepamirškite spėti!" : `Greitai prasideda ${urgent.length} varžybos be spėjimo`}
          </div>
        </div>
        <button
          onClick={() => onPredict(soonest._id)}
          className="shrink-0 px-3.5 py-2 rounded-lg bg-white text-red-600 text-sm font-bold hover:bg-red-50 transition-colors cursor-pointer"
        >
          Spėti
        </button>
      </div>
    );
  }

  // Calm reminder for matches further out.
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-amber-500/15 border border-amber-500/20 text-amber-400 animate-fade-up">
      <AlertCircle size={16} className="shrink-0" />
      <span className="text-sm flex-1">
        Turite <strong>{unpredicted.length}</strong> {unpredicted.length === 1 ? "varžybą" : "varžybas"} be spėjimo
      </span>
      <button
        onClick={() => onPredict(next._id)}
        className="shrink-0 text-sm font-bold text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline cursor-pointer"
      >
        Spėti artimiausią
      </button>
    </div>
  );
}

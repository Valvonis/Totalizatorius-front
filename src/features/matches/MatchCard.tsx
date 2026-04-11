import Flag from "../../components/Flag";
import { useAuth } from "../auth/useAuth";
import { formatMatchTime, timeFromNow, isMatchStarted } from "../../utils/date";
import { Clock, Check, X as XIcon, Trophy } from "lucide-react";
import type { Match } from "../../types";

interface MatchCardProps {
  match: Match;
  onPredict: (matchId: string) => void;
}

function pointsColor(pts: number | null): string {
  if (pts === null) return "text-gray-400";
  if (pts === 5) return "text-[var(--color-points-5)]";
  if (pts === 3) return "text-[var(--color-points-3)]";
  if (pts === 1) return "text-[var(--color-points-1)]";
  return "text-[var(--color-points-0)]";
}

export default function MatchCard({ match, onPredict }: MatchCardProps) {
  const { player } = useAuth();
  const started = isMatchStarted(match.time);
  const currentPlayerPredicted = match.predictions.some(
    (p) => p.playerId === player?.id
  );
  const canPredict = !started && !currentPlayerPredicted;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      {/* Time header */}
      <div className="flex justify-between items-center px-4 py-2 text-gray-500 text-xs">
        <span>{timeFromNow(match.time)}</span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {formatMatchTime(match.time)}
        </span>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-center gap-6 py-6 px-4">
        <div className="flex flex-col items-center gap-1 w-20">
          <Flag countryName={match.team1} />
          <span className="text-xs text-center text-gray-700 leading-tight">{match.team1}</span>
        </div>
        <div className="text-4xl font-bold text-gray-900 min-w-[60px] text-center">
          {match.team1Score !== null ? `${match.team1Score}-${match.team2Score}` : "vs"}
        </div>
        <div className="flex flex-col items-center gap-1 w-20">
          <Flag countryName={match.team2} />
          <span className="text-xs text-center text-gray-700 leading-tight">{match.team2}</span>
        </div>
      </div>

      {/* Predictions */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {match.predictions.map((pred) => (
            <div key={pred.id} className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-gray-500">{pred.playerName}</span>
              {started ? (
                <>
                  <span className="font-bold text-sm">
                    {pred.team1Goal}:{pred.team2Goal}
                  </span>
                  <span className={`text-xs font-bold ${pointsColor(pred.points)}`}>
                    {pred.points !== null ? `+${pred.points}` : "-"}
                  </span>
                </>
              ) : (
                <span className="text-green-600">
                  <Check size={16} />
                </span>
              )}
            </div>
          ))}
          {/* Show empty slots for players who haven't predicted */}
          {!started &&
            Array.from({ length: Math.max(0, 3 - match.predictions.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-gray-300">-</span>
                <span className="text-red-400">
                  <XIcon size={16} />
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Predict button */}
      <div className="mt-auto border-t border-gray-100">
        <button
          onClick={() => onPredict(match._id)}
          disabled={!canPredict}
          className="w-full py-3 flex items-center justify-center gap-2 text-[var(--color-primary)] font-bold hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Trophy size={18} />
          <span>SPĖTI</span>
        </button>
      </div>
    </div>
  );
}

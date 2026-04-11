import Flag from "../../components/Flag";
import { useAuth } from "../auth/useAuth";
import { formatMatchTime, timeFromNow, isMatchStarted } from "../../utils/date";
import { Clock, Check, Timer, Trophy } from "lucide-react";
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

function pointsBg(pts: number | null): string {
  if (pts === null) return "";
  if (pts === 5) return "bg-green-50";
  if (pts === 3) return "bg-blue-50";
  if (pts === 1) return "bg-orange-50";
  return "";
}

export default function MatchCard({ match, onPredict }: MatchCardProps) {
  const { player } = useAuth();
  const started = isMatchStarted(match.time);
  const currentPlayerPredicted = match.predictions.some(
    (p) => p.playerId === player?.id
  );
  const canPredict = !started && !currentPlayerPredicted;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 animate-fade-up">
      {/* Time header */}
      <div className="flex justify-between items-center px-4 py-2.5 text-gray-400 text-xs bg-gray-50/80 border-b border-gray-100">
        <span>{timeFromNow(match.time)}</span>
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {formatMatchTime(match.time)}
        </span>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-center gap-6 py-6 px-4">
        <div className="flex flex-col items-center gap-1.5 w-20">
          <Flag countryName={match.team1} />
          <span className="text-xs text-center text-gray-600 leading-tight font-medium">{match.team1}</span>
        </div>
        <div className="min-w-[60px] text-center">
          {match.team1Score !== null ? (
            <span className="text-4xl font-bold text-gray-900">{match.team1Score}-{match.team2Score}</span>
          ) : (
            <span className="text-lg text-gray-300 italic font-medium">vs</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-1.5 w-20">
          <Flag countryName={match.team2} />
          <span className="text-xs text-center text-gray-600 leading-tight font-medium">{match.team2}</span>
        </div>
      </div>

      {/* Predictions */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {match.predictions.map((pred) => (
            <div key={pred.id} className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg ${started ? pointsBg(pred.points) : ""}`}>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{pred.playerName}</span>
              {started ? (
                <>
                  <span className="font-bold text-sm text-gray-800">
                    {pred.team1Goal}:{pred.team2Goal}
                  </span>
                  <span className={`text-xs font-bold ${pointsColor(pred.points)}`}>
                    {pred.points !== null ? `+${pred.points}` : "-"}
                  </span>
                </>
              ) : (
                <span className="text-green-500">
                  <Check size={16} />
                </span>
              )}
            </div>
          ))}
          {/* Waiting slots — friendly indicator instead of red X */}
          {!started &&
            Array.from({ length: Math.max(0, 3 - match.predictions.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg">
                <span className="text-[10px] text-gray-300 font-medium">---</span>
                <span className="text-gray-300 animate-pulse-soft">
                  <Timer size={15} />
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Predict button */}
      <div className="mt-auto border-t border-gray-100">
        {canPredict ? (
          <button
            onClick={() => onPredict(match._id)}
            className="w-full py-3 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-light)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Trophy size={18} />
            <span>SPĖTI</span>
          </button>
        ) : (
          <div className="w-full py-3 flex items-center justify-center gap-2 text-gray-300 font-medium text-sm">
            {started ? (
              <span>Varžybos prasidėjo</span>
            ) : currentPlayerPredicted ? (
              <>
                <Check size={16} />
                <span>Spėjimas pateiktas</span>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

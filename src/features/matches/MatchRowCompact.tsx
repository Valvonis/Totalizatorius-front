import Flag from "../../components/Flag";
import { useAuth } from "../auth/useAuth";
import { formatTimeOnly } from "../../utils/date";
import type { Match } from "../../types";

interface MatchRowCompactProps {
  match: Match;
}

function pointsColor(pts: number | null): string {
  if (pts === 5) return "text-[var(--color-points-5)]";
  if (pts === 3) return "text-[var(--color-points-3)]";
  if (pts === 1) return "text-[var(--color-points-1)]";
  if (pts === 0) return "text-[var(--color-points-0)]";
  return "text-[var(--card-text-muted)]";
}

export default function MatchRowCompact({ match }: MatchRowCompactProps) {
  const { player } = useAuth();
  const myPrediction = match.predictions.find((p) => p.playerId === player?.id);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--card-border)] hover:border-[var(--card-text-muted)]/20 transition-colors"
      style={{ background: "var(--card-bg)" }}
    >
      {/* Time */}
      <span className="text-[10px] text-[var(--card-text-muted)] w-10 shrink-0">{formatTimeOnly(match.time)}</span>

      {/* Stage badge */}
      {match.stage && (
        <span className="text-[9px] font-bold text-[var(--card-text-muted)] bg-[var(--card-surface)] px-1 py-0.5 rounded shrink-0 max-sm:hidden">
          {match.stage.replace("Grupė ", "")}
        </span>
      )}

      {/* Team 1 */}
      <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
        <span className="text-xs font-medium text-[var(--card-text-secondary)] truncate text-right">{match.team1}</span>
        <Flag countryName={match.team1} size={20} />
      </div>

      {/* Score */}
      <div className="font-bold text-sm text-[var(--card-text)] min-w-[36px] text-center">
        {match.team1Score !== null ? `${match.team1Score}-${match.team2Score}` : "–"}
      </div>

      {/* Team 2 */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <Flag countryName={match.team2} size={20} />
        <span className="text-xs font-medium text-[var(--card-text-secondary)] truncate">{match.team2}</span>
      </div>

      {/* My prediction + points */}
      {myPrediction ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-[var(--card-text-muted)]">
            {myPrediction.team1Goal}:{myPrediction.team2Goal}
          </span>
          <span className={`text-xs font-bold min-w-[24px] text-right ${pointsColor(myPrediction.points)}`}>
            {myPrediction.points !== null ? `+${myPrediction.points}` : ""}
          </span>
        </div>
      ) : (
        <span className="text-[10px] text-[var(--card-text-muted)] shrink-0 w-[50px]" />
      )}
    </div>
  );
}

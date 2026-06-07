import { useState } from "react";
import Flag from "../../components/Flag";
import { useAuth } from "../auth/useAuth";
import { formatTimeOnly } from "../../utils/date";
import { pointsColor, pointsLabel } from "../../utils/points";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Match } from "../../types";

interface MatchRowCompactProps {
  match: Match;
}

export default function MatchRowCompact({ match }: MatchRowCompactProps) {
  const { player } = useAuth();
  const myPrediction = match.predictions.find((p) => p.playerId === player?.id);
  const [expanded, setExpanded] = useState(false);

  // Winner detection
  const team1Won = match.team1Score !== null && match.team2Score !== null && match.team1Score > match.team2Score;
  const team2Won = match.team1Score !== null && match.team2Score !== null && match.team2Score > match.team1Score;

  return (
    <div
      className="rounded-xl border border-[var(--card-border)] hover:border-[var(--card-text-muted)]/30 transition-colors overflow-hidden"
      style={{ background: "var(--card-bg)" }}
    >
      {/* Main row — clickable to expand */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
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
          <span className={`text-xs truncate text-right ${team1Won ? "font-bold text-[var(--card-text)]" : "font-medium text-[var(--card-text-secondary)]"}`}>
            {match.team1}
          </span>
          <Flag countryName={match.team1} size={20} />
        </div>

        {/* Score */}
        <div className="font-bold text-sm text-[var(--card-text)] min-w-[36px] text-center">
          {match.team1Score !== null ? `${match.team1Score}-${match.team2Score}` : "–"}
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Flag countryName={match.team2} size={20} />
          <span className={`text-xs truncate ${team2Won ? "font-bold text-[var(--card-text)]" : "font-medium text-[var(--card-text-secondary)]"}`}>
            {match.team2}
          </span>
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

        {/* Expand indicator */}
        {match.predictions.length > 0 && (
          <span className="text-[var(--card-text-muted)] shrink-0">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        )}
      </div>

      {/* Expanded: all predictions */}
      {expanded && match.predictions.length > 0 && (
        <div className="border-t border-[var(--card-border)] px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 animate-fade-in">
          {match.predictions.map((pred) => (
            <div key={pred.id} className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[var(--card-text-muted)]">{pred.playerName}</span>
              <span className="font-bold text-[var(--card-text)]">{pred.team1Goal}:{pred.team2Goal}</span>
              <span className={`font-bold ${pointsColor(pred.points)}`} title={pointsLabel(pred.points)}>
                {pred.points !== null ? `+${pred.points}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

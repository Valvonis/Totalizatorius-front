import { useState, useMemo } from "react";
import Flag from "../../components/Flag";
import { useAuth } from "../auth/useAuth";
import { formatMatchTime, timeFromNow, isMatchStarted, getMatchUrgency, getCountdown } from "../../utils/date";
import { Clock, Check, Timer, Trophy, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { pointsColor, pointsLabelLong, pointsBg } from "../../utils/points";
import { getStageStyle, isKnockout } from "./stages";
import type { Match } from "../../types";

interface MatchCardProps {
  match: Match;
  onPredict: (matchId: string) => void;
  // Full league roster (id + name). Drives the pre-kickoff "X / Y spėjo" summary and the
  // list of who's still missing. Optional so the card degrades to a bare count if the
  // leaderboard hasn't loaded yet.
  roster?: { id: string; name: string }[];
}

// Above this many revealed predictions the started-card grid collapses behind a toggle.
const PREDICTION_CAP = 6;
// At/below this many players still missing, name them; above it, just show the count.
const NAME_THRESHOLD = 6;

export default function MatchCard({ match, onPredict, roster = [] }: MatchCardProps) {
  const { player } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const started = isMatchStarted(match.time);
  const currentPlayerPredicted = match.predictions.some(
    (p) => p.playerId === player?.id
  );

  // Started card: own prediction first, then the rest by points (highest first, unscored last).
  const orderedPredictions = useMemo(() => {
    const mine = match.predictions.filter((p) => p.playerId === player?.id);
    const others = match.predictions
      .filter((p) => p.playerId !== player?.id)
      .sort((a, b) => (b.points ?? -1) - (a.points ?? -1));
    return [...mine, ...others];
  }, [match.predictions, player?.id]);
  const visiblePredictions = showAll ? orderedPredictions : orderedPredictions.slice(0, PREDICTION_CAP);
  const hiddenCount = orderedPredictions.length - visiblePredictions.length;
  const canPredict = !started && !currentPlayerPredicted;

  // Upcoming card: picks are hidden until kickoff, so show progress instead. The roster is
  // the denominator; everyone not in match.predictions is still waiting ("Tu" surfaced first).
  const guessedCount = match.predictions.length;
  const knownRoster = roster.length > 0;
  const denom = Math.max(roster.length, guessedCount);
  const guessedIds = new Set(match.predictions.map((p) => p.playerId));
  const remainingNames = roster
    .filter((r) => !guessedIds.has(r.id))
    .map((r) => (r.id === player?.id ? "Tu" : r.name))
    .sort((a, b) => (a === "Tu" ? -1 : b === "Tu" ? 1 : 0));
  const stageStyle = getStageStyle(match.stage || "");
  const knockout = isKnockout(match.stage || "");
  const team1Won = match.team1Score !== null && match.team2Score !== null && match.team1Score > match.team2Score;
  const team2Won = match.team1Score !== null && match.team2Score !== null && match.team2Score > match.team1Score;

  return (
    <div
      className={`rounded-2xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 animate-fade-up ${stageStyle.border} ${stageStyle.glow}`}
      style={{ background: "var(--card-bg)" }}
    >
      {/* Time header */}
      {(() => {
        const urgency = getMatchUrgency(match.time);
        const urgencyStyles = {
          plenty: "text-[var(--card-text-muted)]",
          soon: "bg-amber-500/10 text-amber-500",
          urgent: "bg-red-500/10 text-red-500",
          started: "text-[var(--card-text-muted)]",
        };
        return (
          <div className={`flex justify-between items-center px-4 py-2.5 text-xs border-b border-[var(--card-border)] ${urgencyStyles[urgency]}`} style={{ background: "var(--card-surface)" }}>
            <div className="flex items-center gap-2">
              {!started ? (
                <span className="flex items-center gap-1 font-medium">
                  {urgency === "urgent" && <AlertTriangle size={12} />}
                  {getCountdown(match.time)}
                </span>
              ) : (
                <span>{timeFromNow(match.time)}</span>
              )}
              {match.stage && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${stageStyle.badge}`}>
                  {stageStyle.icon}
                  {match.stage}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-[var(--card-text-muted)]">
              <Clock size={13} />
              {formatMatchTime(match.time)}
            </span>
          </div>
        );
      })()}

      {/* Teams & Score */}
      <div className={`flex items-center justify-center gap-6 px-4 ${knockout ? "py-8" : "py-6"}`}>
        <div className={`flex flex-col items-center gap-1.5 w-20 ${team2Won ? "opacity-50" : ""}`}>
          <Flag countryName={match.team1} size={knockout ? 56 : 48} />
          <span className={`text-xs text-center leading-tight ${team1Won ? "font-bold text-[var(--card-text)]" : "font-medium text-[var(--card-text-secondary)]"}`}>{match.team1}</span>
        </div>
        <div className="min-w-[60px] text-center">
          {match.team1Score !== null ? (
            <span className={`${stageStyle.scoreSize} font-bold text-[var(--card-text)]`}>{match.team1Score}-{match.team2Score}</span>
          ) : (
            <span className="text-lg text-[var(--card-text-muted)] italic font-medium">vs</span>
          )}
        </div>
        <div className={`flex flex-col items-center gap-1.5 w-20 ${team1Won ? "opacity-50" : ""}`}>
          <Flag countryName={match.team2} size={knockout ? 56 : 48} />
          <span className={`text-xs text-center leading-tight ${team2Won ? "font-bold text-[var(--card-text)]" : "font-medium text-[var(--card-text-secondary)]"}`}>{match.team2}</span>
        </div>
      </div>

      {/* Predictions */}
      <div className="px-4 pb-4">
        {started ? (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              {visiblePredictions.map((pred) => (
                <div key={pred.id} className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg ${pointsBg(pred.points)}`}>
                  <span className="text-[10px] text-[var(--card-text-muted)] font-medium uppercase tracking-wide">{pred.playerName}</span>
                  <span className="font-bold text-sm text-[var(--card-text)]">
                    {pred.team1Goal}:{pred.team2Goal}
                  </span>
                  <span className={`text-xs font-bold ${pointsColor(pred.points)}`} title={pointsLabelLong(pred.points)}>
                    {pred.points !== null ? `+${pred.points}` : "-"}
                  </span>
                </div>
              ))}
            </div>
            {orderedPredictions.length > PREDICTION_CAP && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full mt-2 flex items-center justify-center gap-1 py-1 text-[var(--card-text-muted)] hover:text-[var(--card-text)] text-xs cursor-pointer transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUp size={13} />
                    Rodyti mažiau
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />
                    + dar {hiddenCount}
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          /* Upcoming: picks stay hidden until kickoff — show who's locked in vs still missing. */
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-[var(--card-text-secondary)] shrink-0 flex items-center gap-1">
                Spėjo {guessedCount}{knownRoster ? ` / ${denom}` : ""}
                {knownRoster && remainingNames.length === 0 && <Check size={13} className="text-green-500" />}
              </span>
              {knownRoster && (
                <div className="flex-1 h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${denom > 0 ? (guessedCount / denom) * 100 : 0}%` }}
                  />
                </div>
              )}
            </div>
            {knownRoster && remainingNames.length > 0 && (
              <div className="flex items-start gap-1 text-[11px] text-[var(--card-text-muted)]">
                <Timer size={12} className="animate-pulse-soft shrink-0 mt-0.5" />
                <span>
                  {remainingNames.length <= NAME_THRESHOLD
                    ? `dar laukiama: ${remainingNames.join(" · ")}`
                    : `dar nespėjo ${remainingNames.length}`}
                </span>
              </div>
            )}
            {knownRoster && remainingNames.length === 0 && (
              <div className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
                <Check size={12} />
                <span>Visi spėjo</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Predict button */}
      <div className="mt-auto border-t border-[var(--card-border)]">
        {canPredict ? (
          <button
            onClick={() => onPredict(match._id)}
            className="w-full py-3 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-light)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Trophy size={18} />
            <span>SPĖTI</span>
          </button>
        ) : (
          <div className="w-full py-3 flex items-center justify-center gap-2 text-[var(--card-text-muted)] font-medium text-sm">
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

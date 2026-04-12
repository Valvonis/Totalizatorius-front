import Flag from "../../components/Flag";
import { useAuth } from "../auth/useAuth";
import { formatMatchTime, timeFromNow, isMatchStarted, getMatchUrgency, getCountdown } from "../../utils/date";
import { Clock, Check, Timer, Trophy, AlertTriangle, Star, Crown } from "lucide-react";
import type { Match } from "../../types";

interface MatchCardProps {
  match: Match;
  onPredict: (matchId: string) => void;
}

function pointsColor(pts: number | null): string {
  if (pts === null) return "text-[var(--card-text-muted)]";
  if (pts === 5) return "text-[var(--color-points-5)]";
  if (pts === 3) return "text-[var(--color-points-3)]";
  if (pts === 1) return "text-[var(--color-points-1)]";
  return "text-[var(--color-points-0)]";
}

function pointsLabel(pts: number | null): string {
  if (pts === 5) return "Tikslus rezultatas!";
  if (pts === 3) return "Teisingas skirtumas";
  if (pts === 1) return "Teisingas nugalėtojas";
  if (pts === 0) return "Neteisingas spėjimas";
  return "";
}

function pointsBg(pts: number | null): string {
  if (pts === null) return "";
  if (pts === 5) return "bg-green-500/10";
  if (pts === 3) return "bg-blue-500/10";
  if (pts === 1) return "bg-orange-500/10";
  return "";
}

type StageStyle = {
  border: string;
  glow: string;
  badge: string;
  scoreSize: string;
  icon: React.ReactNode | null;
};

function getStageStyle(stage: string): StageStyle {
  if (stage === "Finalas") {
    return {
      border: "ring-2 ring-yellow-400 border-yellow-400/50",
      glow: "shadow-[0_0_20px_rgba(250,204,21,0.15)]",
      badge: "bg-yellow-400 text-yellow-900",
      scoreSize: "text-5xl",
      icon: <Crown size={16} className="text-yellow-900" />,
    };
  }
  if (stage === "Pusfinalis") {
    return {
      border: "ring-2 ring-yellow-400/60 border-yellow-400/30",
      glow: "shadow-[0_0_12px_rgba(250,204,21,0.1)]",
      badge: "bg-yellow-400/80 text-yellow-900",
      scoreSize: "text-5xl",
      icon: <Star size={14} className="text-yellow-900" />,
    };
  }
  if (stage === "3 vietos rungtynės") {
    return {
      border: "ring-1 ring-amber-600/40 border-amber-600/20",
      glow: "",
      badge: "bg-amber-600/80 text-white",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  if (stage === "Ketvirtfinalis") {
    return {
      border: "ring-1 ring-yellow-500/40 border-yellow-500/20",
      glow: "",
      badge: "bg-yellow-500/20 text-yellow-600",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  if (stage === "Aštuntfinalis") {
    return {
      border: "border-l-4 border-l-indigo-400 border-[var(--card-border)]",
      glow: "",
      badge: "bg-indigo-500/15 text-indigo-500",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  if (stage === "Šešioliktfinalis") {
    return {
      border: "border-l-[3px] border-l-blue-400 border-[var(--card-border)]",
      glow: "",
      badge: "bg-blue-500/15 text-blue-500",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  // Group stage — default
  return {
    border: "border border-[var(--card-border)]",
    glow: "",
    badge: "bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]",
    scoreSize: "text-4xl",
    icon: null,
  };
}

function isKnockout(stage: string): boolean {
  return ["Šešioliktfinalis", "Aštuntfinalis", "Ketvirtfinalis", "Pusfinalis", "3 vietos rungtynės", "Finalas"].includes(stage);
}

export default function MatchCard({ match, onPredict }: MatchCardProps) {
  const { player } = useAuth();
  const started = isMatchStarted(match.time);
  const currentPlayerPredicted = match.predictions.some(
    (p) => p.playerId === player?.id
  );
  const canPredict = !started && !currentPlayerPredicted;
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
        <div className="grid grid-cols-3 gap-2 text-center">
          {match.predictions.map((pred) => (
            <div key={pred.id} className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg ${started ? pointsBg(pred.points) : ""}`}>
              <span className="text-[10px] text-[var(--card-text-muted)] font-medium uppercase tracking-wide">{pred.playerName}</span>
              {started ? (
                <>
                  <span className="font-bold text-sm text-[var(--card-text)]">
                    {pred.team1Goal}:{pred.team2Goal}
                  </span>
                  <span className={`text-xs font-bold ${pointsColor(pred.points)}`} title={pointsLabel(pred.points)}>
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
          {/* Waiting slots */}
          {!started &&
            Array.from({ length: Math.max(0, 3 - match.predictions.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg">
                <span className="text-[10px] text-[var(--card-text-muted)] font-medium">---</span>
                <span className="text-[var(--card-text-muted)] animate-pulse-soft">
                  <Timer size={15} />
                </span>
              </div>
            ))}
        </div>
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

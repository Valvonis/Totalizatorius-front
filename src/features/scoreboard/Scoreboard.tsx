import { useAppSelector } from "../../hooks";
import { Trophy, Medal } from "lucide-react";
import { ScoreboardSkeleton } from "../../components/ui/Skeleton";

const medalStyles = [
  { bg: "bg-yellow-400/25", border: "ring-1 ring-yellow-400/40", icon: <Trophy size={16} className="text-yellow-400" />, textSize: "text-xl max-sm:text-lg" },
  { bg: "bg-gray-300/15", border: "ring-1 ring-gray-300/30", icon: <Medal size={14} className="text-gray-300" />, textSize: "text-lg max-sm:text-base" },
  { bg: "bg-amber-600/15", border: "ring-1 ring-amber-600/30", icon: <Medal size={14} className="text-amber-600" />, textSize: "text-lg max-sm:text-base" },
];

export default function Scoreboard() {
  const { entries, loading } = useAppSelector((s) => s.scoreboard);

  if (loading) return <ScoreboardSkeleton />;
  if (entries.length === 0) return null;

  return (
    <div className="flex gap-2 items-end justify-center">
      {entries.slice(0, 3).map((entry, i) => {
        const style = medalStyles[i] ?? medalStyles[2];
        return (
          <div
            key={entry.playerId}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${style.bg} ${style.border} ${i === 0 ? "scale-105" : ""}`}
          >
            {style.icon}
            <span className="text-white/80 text-[10px] font-medium uppercase tracking-wide">{entry.playerName}</span>
            <span className={`text-white font-bold ${style.textSize}`}>{entry.totalPoints}</span>
          </div>
        );
      })}
    </div>
  );
}

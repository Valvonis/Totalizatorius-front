import { useAppSelector } from "../../hooks";
import { Trophy } from "lucide-react";

export default function Scoreboard() {
  const { entries, loading } = useAppSelector((s) => s.scoreboard);

  if (loading || entries.length === 0) return null;

  return (
    <div className="flex gap-4 items-end justify-center">
      {entries.map((entry, i) => (
        <div
          key={entry.playerId}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${
            i === 0 ? "bg-yellow-400/20 scale-110" : "bg-white/10"
          }`}
        >
          {i === 0 && <Trophy size={20} className="text-yellow-400" />}
          <span className="text-white text-sm max-sm:text-xs">{entry.playerName}</span>
          <span className="text-white font-bold text-2xl max-sm:text-xl">{entry.totalPoints}</span>
        </div>
      ))}
    </div>
  );
}

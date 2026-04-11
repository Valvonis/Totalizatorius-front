import { useMemo } from "react";
import { useAppSelector } from "../../hooks";
import MatchCard from "./MatchCard";
import { isMatchStarted } from "../../utils/date";
import { MatchCardSkeleton } from "../../components/ui/Skeleton";
import { Calendar, History } from "lucide-react";

interface MatchListProps {
  onPredict: (matchId: string) => void;
}

export default function MatchList({ onPredict }: MatchListProps) {
  const { items, loading } = useAppSelector((s) => s.matches);

  const { upcoming, past } = useMemo(() => {
    const upcoming = items.filter((m) => !isMatchStarted(m.time));
    const past = items.filter((m) => isMatchStarted(m.time)).reverse();
    return { upcoming, past };
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <section>
          <div className="h-10 bg-white/10 rounded-xl mb-4 animate-shimmer" />
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-white text-2xl text-center py-2.5 mb-4 rounded-xl bg-gradient-to-r from-green-600/60 via-green-500/40 to-green-600/60 flex items-center justify-center gap-2 backdrop-blur-sm">
            <Calendar size={20} />
            Artėjančios varžybos
          </h2>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
            {upcoming.map((m) => (
              <MatchCard key={m._id} match={m} onPredict={onPredict} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-white text-2xl text-center py-2.5 mb-4 rounded-xl bg-gradient-to-r from-white/10 via-white/20 to-white/10 flex items-center justify-center gap-2 backdrop-blur-sm">
            <History size={20} />
            Praėjusios varžybos
          </h2>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
            {past.map((m) => (
              <MatchCard key={m._id} match={m} onPredict={onPredict} />
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-white/50 text-lg">Varžybų dar nėra.</p>
          <p className="text-white/30 text-sm mt-1">Turnyras neturi varžybų</p>
        </div>
      )}
    </div>
  );
}

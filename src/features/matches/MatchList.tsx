import { useMemo } from "react";
import { useAppSelector } from "../../hooks";
import MatchCard from "./MatchCard";
import { isMatchStarted } from "../../utils/date";
import { Loader2 } from "lucide-react";

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
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-white text-2xl text-center bg-black/40 rounded-xl py-2 mb-4">
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
          <h2 className="text-white text-2xl text-center bg-black/40 rounded-xl py-2 mb-4">
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
        <p className="text-white/70 text-center py-8">Varžybų dar nėra.</p>
      )}
    </div>
  );
}

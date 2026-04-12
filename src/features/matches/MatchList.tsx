import { useMemo, useState } from "react";
import { useAppSelector } from "../../hooks";
import { useAuth } from "../auth/useAuth";
import MatchCard from "./MatchCard";
import MatchRowCompact from "./MatchRowCompact";
import { isMatchStarted, isToday, getDateKey, formatDayHeader } from "../../utils/date";
import { MatchCardSkeleton } from "../../components/ui/Skeleton";
import { Calendar, History, Flame, AlertCircle, ChevronDown, ChevronUp, LayoutGrid, List } from "lucide-react";
import type { Match } from "../../types";

interface MatchListProps {
  onPredict: (matchId: string) => void;
}

// Extract unique stages with match counts
function getStagesWithCounts(matches: Match[]): { stage: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of matches) {
    if (m.stage) map.set(m.stage, (map.get(m.stage) || 0) + 1);
  }
  const knockoutOrder = ["Šešioliktfinalis", "Aštuntfinalis", "Ketvirtfinalis", "Pusfinalis", "3 vietos rungtynės", "Finalas"];
  return Array.from(map.entries())
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => {
      const aKO = knockoutOrder.indexOf(a.stage);
      const bKO = knockoutOrder.indexOf(b.stage);
      if (aKO === -1 && bKO === -1) return a.stage.localeCompare(b.stage);
      if (aKO === -1) return -1;
      if (bKO === -1) return 1;
      return aKO - bKO;
    });
}

// Group matches by date
function groupByDate(matches: Match[]): { date: string; label: string; matches: Match[] }[] {
  const map = new Map<string, Match[]>();
  for (const m of matches) {
    const key = getDateKey(m.time);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).map(([date, matches]) => ({
    date,
    label: formatDayHeader(matches[0].time),
    matches,
  }));
}

export default function MatchList({ onPredict }: MatchListProps) {
  const { items, loading } = useAppSelector((s) => s.matches);
  const { player } = useAuth();
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [showAllPast, setShowAllPast] = useState(false);
  const [pastView, setPastView] = useState<"compact" | "cards">(() => {
    return (localStorage.getItem("past-view") as "compact" | "cards") || "cards";
  });

  const togglePastView = () => {
    const next = pastView === "compact" ? "cards" : "compact";
    setPastView(next);
    localStorage.setItem("past-view", next);
  };

  const { todayMatches, upcoming, pastDays, stagesWithCounts, needsPrediction, totalPlayed, totalMatches } = useMemo(() => {
    let filtered = items;
    if (stageFilter) {
      filtered = items.filter((m) => m.stage === stageFilter);
    }

    const todayMatches = filtered.filter((m) => isToday(m.time));
    const upcoming = filtered.filter((m) => !isMatchStarted(m.time) && !isToday(m.time));
    const past = filtered.filter((m) => isMatchStarted(m.time) && !isToday(m.time)).reverse();
    const pastDays = groupByDate(past);
    const stagesWithCounts = getStagesWithCounts(items);
    const needsPrediction = filtered.filter(
      (m) => !isMatchStarted(m.time) && !m.predictions.some((p) => p.playerId === player?.id)
    );
    const totalPlayed = items.filter((m) => m.team1Score !== null).length;
    const totalMatches = items.length;

    return { todayMatches, upcoming, pastDays, stagesWithCounts, needsPrediction, totalPlayed, totalMatches };
  }, [items, stageFilter, player]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-10 bg-white/10 rounded-xl animate-shimmer" />
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const shortStage = (s: string) => s.replace("Grupė ", "");
  const INITIAL_PAST_DAYS = 3;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress summary + filter bar */}
      <div>
        {/* Progress bar */}
        {totalMatches > 0 && (
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(totalPlayed / totalMatches) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-white/50 shrink-0 tabular-nums">
              {totalPlayed}/{totalMatches} sužaista
            </span>
          </div>
        )}

        {/* Filter tabs */}
        {stagesWithCounts.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStageFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                !stageFilter
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Visos
            </button>
            {stagesWithCounts.map(({ stage, count }) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stageFilter === stage ? null : stage)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  stageFilter === stage
                    ? "bg-white text-[var(--color-primary)] shadow-sm"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {shortStage(stage)}
                <span className={`text-[10px] ${stageFilter === stage ? "text-[var(--color-primary)]/60" : "text-white/40"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Needs prediction alert */}
      {needsPrediction.length > 0 && !stageFilter && (
        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-xl px-4 py-2.5 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>Turite <strong>{needsPrediction.length}</strong> {needsPrediction.length === 1 ? "varžybą" : "varžybas"} be spėjimo</span>
        </div>
      )}

      {/* Today's matches */}
      {todayMatches.length > 0 && (
        <section>
          <h2 className="text-white text-2xl text-center py-2.5 mb-4 rounded-xl bg-gradient-to-r from-red-600/50 via-orange-500/40 to-red-600/50 flex items-center justify-center gap-2 backdrop-blur-sm">
            <Flame size={20} />
            Šiandien
          </h2>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
            {todayMatches.map((m) => (
              <MatchCard key={m._id} match={m} onPredict={onPredict} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming matches grouped by date */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-white text-2xl text-center py-2.5 mb-4 rounded-xl bg-gradient-to-r from-green-600/60 via-green-500/40 to-green-600/60 flex items-center justify-center gap-2 backdrop-blur-sm">
            <Calendar size={20} />
            Artėjančios varžybos
          </h2>
          {groupByDate(upcoming).map((day) => (
            <div key={day.date} className="mb-4">
              <h3 className="text-white/60 text-sm font-medium mb-2 px-1 capitalize">{day.label}</h3>
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
                {day.matches.map((m) => (
                  <MatchCard key={m._id} match={m} onPredict={onPredict} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Past matches */}
      {pastDays.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl py-2.5 px-4 rounded-xl bg-gradient-to-r from-white/10 via-white/20 to-white/10 flex items-center gap-2 backdrop-blur-sm flex-1 justify-center">
              <History size={20} />
              Praėjusios varžybos
            </h2>
            <button
              onClick={togglePastView}
              className="ml-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title={pastView === "compact" ? "Rodyti korteles" : "Rodyti kompaktiškai"}
            >
              {pastView === "compact" ? <LayoutGrid size={15} /> : <List size={15} />}
              <span className="max-sm:hidden">{pastView === "compact" ? "Kortelės" : "Kompaktiškai"}</span>
            </button>
          </div>

          {(showAllPast ? pastDays : pastDays.slice(0, INITIAL_PAST_DAYS)).map((day) => (
            <div key={day.date} className="mb-4">
              <h3 className="text-white/50 text-xs font-medium mb-2 px-1 capitalize">{day.label}</h3>
              {pastView === "compact" ? (
                <div className="flex flex-col gap-1">
                  {day.matches.map((m) => (
                    <MatchRowCompact key={m._id} match={m} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
                  {day.matches.map((m) => (
                    <MatchCard key={m._id} match={m} onPredict={onPredict} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {pastDays.length > INITIAL_PAST_DAYS && (
            <button
              onClick={() => setShowAllPast(!showAllPast)}
              className="w-full flex items-center justify-center gap-1 py-2 text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors"
            >
              {showAllPast ? (
                <>
                  <ChevronUp size={14} />
                  Rodyti mažiau
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Rodyti visas ({pastDays.length - INITIAL_PAST_DAYS} daugiau dienų)
                </>
              )}
            </button>
          )}
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

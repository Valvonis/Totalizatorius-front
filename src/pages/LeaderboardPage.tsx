import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchLeaderboard } from "../features/scoreboard/scoreboardSlice";
import { fetchActiveTournament } from "../features/tournaments/tournamentSlice";
import Layout from "../components/Layout";
import { Trophy, Medal, Target, TrendingUp, XCircle, BarChart3, Calendar, ChevronRight } from "lucide-react";
import { dayjs } from "../utils/date";

const rankStyles = [
  { bg: "bg-gradient-to-r from-yellow-50 to-yellow-100/50", border: "ring-2 ring-yellow-400", icon: <Trophy size={24} className="text-yellow-500" />, label: "bg-yellow-400 text-yellow-900" },
  { bg: "bg-gradient-to-r from-gray-50 to-gray-100/50", border: "ring-2 ring-gray-300", icon: <Medal size={22} className="text-gray-400" />, label: "bg-gray-300 text-gray-700" },
  { bg: "bg-gradient-to-r from-amber-50 to-orange-50/50", border: "ring-2 ring-amber-500", icon: <Medal size={22} className="text-amber-600" />, label: "bg-amber-500 text-white" },
];

export default function LeaderboardPage() {
  const dispatch = useAppDispatch();
  const tournament = useAppSelector((s) => s.tournament.active);
  const { entries, loading } = useAppSelector((s) => s.scoreboard);

  useEffect(() => {
    dispatch(fetchActiveTournament());
  }, [dispatch]);

  useEffect(() => {
    if (tournament) dispatch(fetchLeaderboard(tournament._id));
  }, [dispatch, tournament]);

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="text-center py-3 rounded-xl bg-gradient-to-r from-yellow-600/40 via-yellow-500/30 to-yellow-600/40 backdrop-blur-sm">
          <h2 className="text-white text-2xl flex items-center justify-center gap-2">
            <BarChart3 size={22} />
            Turnyro lentelė
          </h2>
          {tournament && (
            <div className="flex items-center justify-center gap-1.5 text-white/40 text-xs mt-1">
              <Calendar size={12} />
              <span>{tournament.name} · {dayjs(tournament.startDate).format("YYYY.MM.DD")} – {dayjs(tournament.endDate).format("MM.DD")}</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-shimmer" />
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <p className="text-white/50 text-center py-12">Dar nėra rezultatų.</p>
        )}

        <div className="flex flex-col gap-4">
          {entries.map((entry, i) => {
            const style = rankStyles[i];
            const accuracy = entry.totalPredictions > 0
              ? Math.round(((entry.totalPredictions - entry.wrongPredictions) / entry.totalPredictions) * 100)
              : 0;

            return (
              <div
                key={entry.playerId}
                className={`rounded-2xl shadow-md overflow-hidden animate-fade-up border border-[var(--card-border)] ${style ? style.border : ""}`}
                style={{ background: "var(--card-bg)", animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
              >
                {/* Header row */}
                <div className={`flex items-center gap-3 px-5 py-4 ${style?.bg ?? "bg-white"}`}>
                  <div className="flex items-center gap-3 flex-1">
                    {style ? (
                      style.icon
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-[var(--card-surface)] flex items-center justify-center text-sm font-bold text-gray-500">
                        {i + 1}
                      </span>
                    )}
                    <div>
                      <Link to={`/player/${entry.playerSlug}`} className="font-bold text-lg text-gray-900 no-underline hover:text-[var(--color-primary-light)] hover:underline transition-colors flex items-center gap-1">
                        {entry.playerName}
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                      {style && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.label}`}>
                          {i === 0 ? "1 vieta" : i === 1 ? "2 vieta" : "3 vieta"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--card-text)]">{entry.totalPoints}</div>
                    <div className="text-[10px] text-[var(--card-text-muted)] uppercase tracking-wide">taškai</div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 border-t border-[var(--card-border)]">
                  {/* Points breakdown */}
                  <div className="px-5 py-3 border-r border-[var(--card-border)]">
                    <div className="text-[10px] text-[var(--card-text-muted)] uppercase tracking-wide mb-2">Taškų šaltiniai</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--card-text-secondary)]">Varžybos</span>
                      <span className="font-bold text-[var(--card-text)]">{entry.matchPoints}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--card-text-secondary)]">Klausimai</span>
                      <span className="font-bold text-[var(--card-text)]">{entry.questionPoints}</span>
                    </div>
                  </div>

                  {/* Prediction stats */}
                  <div className="px-5 py-3">
                    <div className="text-[10px] text-[var(--card-text-muted)] uppercase tracking-wide mb-2">Spėjimai ({entry.totalPredictions}/{entry.totalMatches})</div>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-600" title="Tikslūs rezultatai">
                        <Target size={12} />
                        {entry.exactScores}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600" title="Teisingi skirtumai">
                        <TrendingUp size={12} />
                        {entry.correctDifferences}
                      </span>
                      <span className="flex items-center gap-1 text-orange-500" title="Teisingi nugalėtojai">
                        <Trophy size={12} />
                        {entry.correctWinners}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400" title="Neteisingi">
                        <XCircle size={12} />
                        {entry.wrongPredictions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accuracy bar */}
                {entry.totalPredictions > 0 && (
                  <div className="px-5 py-2 border-t border-[var(--card-border)] bg-gray-50/50">
                    <div className="flex items-center justify-between text-[10px] text-[var(--card-text-muted)] mb-1">
                      <span>Tikslumas</span>
                      <span>{accuracy}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full transition-all duration-500"
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

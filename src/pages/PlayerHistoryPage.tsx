import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMatches } from "../features/matches/matchesSlice";
import { fetchLeaderboard } from "../features/scoreboard/scoreboardSlice";
import { fetchActiveTournament } from "../features/tournaments/tournamentSlice";
import Layout from "../components/Layout";
import Flag from "../components/Flag";
import { isMatchStarted } from "../utils/date";
import { Target, TrendingUp, Trophy, XCircle, ArrowLeft, Flame, Award } from "lucide-react";

function pointsColor(pts: number | null): string {
  if (pts === 5) return "text-green-600 bg-green-50";
  if (pts === 3) return "text-blue-600 bg-blue-50";
  if (pts === 1) return "text-orange-500 bg-orange-50";
  if (pts === 0) return "text-gray-400 bg-gray-50";
  return "text-gray-300 bg-gray-50";
}

function pointsIcon(pts: number | null) {
  if (pts === 5) return <Target size={13} />;
  if (pts === 3) return <TrendingUp size={13} />;
  if (pts === 1) return <Trophy size={13} />;
  return <XCircle size={13} />;
}

function pointsLabel(pts: number | null): string {
  if (pts === 5) return "Tikslus";
  if (pts === 3) return "Skirtumas";
  if (pts === 1) return "Nugalėtojas";
  if (pts === 0) return "Neteisingai";
  return "";
}

export default function PlayerHistoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const tournament = useAppSelector((s) => s.tournament.active);
  const matches = useAppSelector((s) => s.matches.items);
  const leaderboard = useAppSelector((s) => s.scoreboard.entries);

  useEffect(() => {
    dispatch(fetchActiveTournament());
  }, [dispatch]);

  useEffect(() => {
    if (tournament) {
      dispatch(fetchMatches(tournament._id));
      dispatch(fetchLeaderboard(tournament._id));
    }
  }, [dispatch, tournament]);

  const playerEntry = leaderboard.find((e) => e.playerSlug === slug);

  const playerMatches = useMemo(() => {
    return matches
      .filter((m) => isMatchStarted(m.time) && m.team1Score !== null)
      .map((m) => {
        const pred = m.predictions.find((p) => p.playerSlug === slug);
        return pred ? { match: m, prediction: pred } : null;
      })
      .filter(Boolean) as { match: typeof matches[0]; prediction: typeof matches[0]["predictions"][0] }[];
  }, [matches, slug]);

  // Calculate streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = playerMatches.length - 1; i >= 0; i--) {
      if ((playerMatches[i].prediction.points ?? 0) > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [playerMatches]);

  // Best prediction
  const bestPrediction = useMemo(() => {
    return playerMatches.reduce<typeof playerMatches[0] | null>((best, curr) => {
      if (!best || (curr.prediction.points ?? 0) > (best.prediction.points ?? 0)) return curr;
      return best;
    }, null);
  }, [playerMatches]);

  const avgPoints = playerMatches.length > 0
    ? (playerMatches.reduce((sum, pm) => sum + (pm.prediction.points ?? 0), 0) / playerMatches.length).toFixed(1)
    : "0";

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/leaderboard" className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors no-underline">
          <ArrowLeft size={16} />
          Atgal į lentelę
        </Link>

        {/* Player header */}
        {playerEntry && (
          <div className="rounded-2xl shadow-md border border-[var(--card-border)] p-6 animate-fade-up" style={{ background: "var(--card-bg)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--card-text)]">{playerEntry.playerName}</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--card-text)]">{playerEntry.totalPoints}</div>
                <div className="text-[10px] text-[var(--card-text-muted)] uppercase tracking-wide">taškai</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--card-surface)" }}>
                <div className="text-lg font-bold text-[var(--card-text)]">{playerEntry.exactScores}</div>
                <div className="text-[10px] text-[var(--card-text-muted)] flex items-center justify-center gap-1">
                  <Target size={10} />
                  Tikslūs
                </div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--card-surface)" }}>
                <div className="text-lg font-bold text-[var(--card-text)]">{playerEntry.correctDifferences}</div>
                <div className="text-[10px] text-[var(--card-text-muted)] flex items-center justify-center gap-1">
                  <TrendingUp size={10} />
                  Skirtumai
                </div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--card-surface)" }}>
                <div className="text-lg font-bold text-[var(--card-text)]">{avgPoints}</div>
                <div className="text-[10px] text-[var(--card-text-muted)] flex items-center justify-center gap-1">
                  <Award size={10} />
                  Vid. taškai
                </div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--card-surface)" }}>
                <div className="text-lg font-bold text-[var(--card-text)] flex items-center justify-center gap-1">
                  {currentStreak > 0 && <Flame size={16} className="text-orange-500" />}
                  {currentStreak}
                </div>
                <div className="text-[10px] text-[var(--card-text-muted)] flex items-center justify-center gap-1">
                  Serija
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Best prediction highlight */}
        {bestPrediction && bestPrediction.prediction.points === 5 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm animate-fade-up">
            <Target size={18} className="text-green-600 shrink-0" />
            <span className="text-green-800">
              Geriausias spėjimas: <strong>{bestPrediction.match.team1} {bestPrediction.prediction.team1Goal}:{bestPrediction.prediction.team2Goal} {bestPrediction.match.team2}</strong> (tikslus rezultatas!)
            </span>
          </div>
        )}

        {/* Prediction history */}
        <div className="rounded-2xl shadow-md border border-[var(--card-border)] overflow-hidden animate-fade-up" style={{ background: "var(--card-bg)" }}>
          <div className="px-5 py-3 border-b border-[var(--card-border)]">
            <h3 className="font-bold text-[var(--card-text)] text-sm">Spėjimų istorija ({playerMatches.length})</h3>
          </div>

          {playerMatches.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Dar nėra įvertintų spėjimų.</p>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {[...playerMatches].reverse().map(({ match, prediction }) => (
                <div key={match._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  {/* Teams */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Flag countryName={match.team1} size={20} />
                    <span className="text-xs text-[var(--card-text-secondary)] truncate">{match.team1}</span>
                    <span className="text-gray-300 text-xs">vs</span>
                    <span className="text-xs text-[var(--card-text-secondary)] truncate">{match.team2}</span>
                    <Flag countryName={match.team2} size={20} />
                  </div>

                  {/* Actual score */}
                  <div className="text-sm font-bold text-[var(--card-text)] min-w-[40px] text-center">
                    {match.team1Score}-{match.team2Score}
                  </div>

                  {/* Prediction */}
                  <div className="text-sm text-gray-500 min-w-[40px] text-center">
                    {prediction.team1Goal}:{prediction.team2Goal}
                  </div>

                  {/* Points badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold min-w-[80px] justify-center ${pointsColor(prediction.points)}`}>
                    {pointsIcon(prediction.points)}
                    <span>{prediction.points !== null ? `+${prediction.points}` : "-"}</span>
                    <span className="font-medium max-sm:hidden">{pointsLabel(prediction.points)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

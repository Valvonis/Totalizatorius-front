import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMatches } from "../features/matches/matchesSlice";
import { fetchActiveTournament, fetchAllTournaments } from "../features/tournaments/tournamentSlice";
import { fetchQuestions } from "../features/questions/questionsSlice";
import { fetchLeagues, setManageLeague } from "../features/leagues/leagueSlice";
import { useAuth } from "../features/auth/useAuth";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import TournamentManager from "../features/admin/TournamentManager";
import LeagueManager from "../features/admin/LeagueManager";
import MatchCreateForm from "../features/admin/MatchCreateForm";
import QuestionManager from "../features/admin/QuestionManager";
import MatchAdminList from "../features/admin/MatchAdminList";
import PlayerManager from "../features/admin/PlayerManager";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { isAdmin, isSuperAdmin, leagueId } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const leagues = useAppSelector((s) => s.leagues.all);
  const manageLeagueId = useAppSelector((s) => s.leagues.manageLeagueId);

  // Which league's questions/players the admin is editing (defaults to own league).
  const activeLeagueId = manageLeagueId || leagueId || null;

  useEffect(() => {
    dispatch(fetchActiveTournament());
    dispatch(fetchAllTournaments());
    if (isSuperAdmin) dispatch(fetchLeagues());
  }, [dispatch, isSuperAdmin]);

  // Default the managed league to the admin's own league once known.
  useEffect(() => {
    if (!manageLeagueId && leagueId) dispatch(setManageLeague(leagueId));
  }, [dispatch, manageLeagueId, leagueId]);

  useEffect(() => {
    if (tournament) {
      dispatch(fetchMatches({ tournamentId: tournament._id }));
      dispatch(fetchQuestions({ tournamentId: tournament._id, leagueId: activeLeagueId || undefined }));
    }
  }, [dispatch, tournament, activeLeagueId]);

  if (!isAdmin) return <Navigate to="/" />;

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <TournamentManager />
        {isSuperAdmin && <LeagueManager />}
        {isSuperAdmin && leagues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <label className="text-sm font-bold text-gray-600 shrink-0">Tvarkoma grupė:</label>
            <select
              value={activeLeagueId ?? ""}
              onChange={(e) => dispatch(setManageLeague(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {leagues.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.memberCount ?? 0})
                </option>
              ))}
            </select>
          </div>
        )}
        <MatchCreateForm />
        <QuestionManager leagueId={activeLeagueId} />
        <MatchAdminList />
        <PlayerManager leagueId={activeLeagueId} />
      </div>
    </Layout>
  );
}

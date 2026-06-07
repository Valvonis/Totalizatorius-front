import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMatches } from "../features/matches/matchesSlice";
import { fetchActiveTournament, fetchAllTournaments } from "../features/tournaments/tournamentSlice";
import { fetchQuestions } from "../features/questions/questionsSlice";
import { useAuth } from "../features/auth/useAuth";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import TournamentManager from "../features/admin/TournamentManager";
import MatchCreateForm from "../features/admin/MatchCreateForm";
import QuestionManager from "../features/admin/QuestionManager";
import MatchAdminList from "../features/admin/MatchAdminList";
import PlayerManager from "../features/admin/PlayerManager";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);

  useEffect(() => {
    dispatch(fetchActiveTournament());
    dispatch(fetchAllTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (tournament) {
      dispatch(fetchMatches({ tournamentId: tournament._id }));
      dispatch(fetchQuestions({ tournamentId: tournament._id }));
    }
  }, [dispatch, tournament]);

  if (!isAdmin) return <Navigate to="/" />;

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <TournamentManager />
        <MatchCreateForm />
        <QuestionManager />
        <MatchAdminList />
        <PlayerManager />
      </div>
    </Layout>
  );
}

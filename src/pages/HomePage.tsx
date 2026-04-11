import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMatches } from "../features/matches/matchesSlice";
import { fetchLeaderboard } from "../features/scoreboard/scoreboardSlice";
import { fetchQuestions } from "../features/questions/questionsSlice";
import { fetchActiveTournament } from "../features/tournaments/tournamentSlice";
import Layout from "../components/Layout";
import MatchList from "../features/matches/MatchList";
import PredictionModal from "../features/predictions/PredictionModal";
import QuestionCard from "../features/questions/QuestionCard";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const tournament = useAppSelector((s) => s.tournament.active);
  const questions = useAppSelector((s) => s.questions.items);
  const [predictingMatchId, setPredictingMatchId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchActiveTournament());
  }, [dispatch]);

  useEffect(() => {
    if (tournament) {
      dispatch(fetchMatches(tournament._id));
      dispatch(fetchLeaderboard(tournament._id));
      dispatch(fetchQuestions(tournament._id));
    }
  }, [dispatch, tournament]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Special Questions */}
        {questions.length > 0 && (
          <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-4">
            {questions.map((q) => (
              <QuestionCard key={q._id} question={q} />
            ))}
          </div>
        )}

        {/* Matches */}
        <MatchList onPredict={setPredictingMatchId} />

        {/* Prediction Modal */}
        <PredictionModal
          matchId={predictingMatchId}
          onClose={() => setPredictingMatchId(null)}
        />
      </div>
    </Layout>
  );
}

import { useState } from "react";
import Flag from "../../components/Flag";
import { useAuth } from "../auth/useAuth";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { submitAnswer, fetchQuestions } from "./questionsSlice";
import { fetchLeaderboard } from "../scoreboard/scoreboardSlice";
import { getCountryNames } from "../../utils/countries";
import { showToast } from "../../components/ui/Toast";
import type { SpecialQuestion } from "../../types";
import { Check, X, HelpCircle, Send, Loader2 } from "lucide-react";

interface QuestionCardProps {
  question: SpecialQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const dispatch = useAppDispatch();
  const { player } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const countries = getCountryNames();

  const [answer, setAnswer] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentPlayerAnswered = question.answers.some(
    (a) => a.playerId._id === player?.id
  );
  const canAnswer = !question.isResolved && !currentPlayerAnswered;

  const handleSubmit = async () => {
    const finalAnswer = question.type === "country" ? answer : playerName;
    if (!finalAnswer) return;

    setSubmitting(true);
    try {
      const additionalData = question.type === "player" ? { player: playerName, fullName: playerName } : undefined;
      await dispatch(submitAnswer({ questionId: question._id, answer: finalAnswer, additionalData })).unwrap();
      showToast("Atsakymas pateiktas!", "success");
      setAnswer("");
      setPlayerName("");
      if (tournament) {
        dispatch(fetchQuestions(tournament._id));
        dispatch(fetchLeaderboard(tournament._id));
      }
    } catch (err) {
      showToast(String(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 animate-fade-up">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-gray-900 text-sm">{question.question}</h3>
        <span className="text-xs font-bold text-[var(--color-accent)] bg-yellow-50 px-2.5 py-1 rounded-full shrink-0">
          +{question.pointValue}
        </span>
      </div>

      {/* Correct answer banner */}
      {question.isResolved && question.correctAnswer && (
        <div className="flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-xl py-2.5 px-4">
          <Check size={16} className="text-green-600 shrink-0" />
          {question.type === "country" ? (
            <div className="flex items-center gap-2">
              <Flag countryName={question.correctAnswer} size={28} />
              <span className="font-bold text-green-800 text-sm">{question.correctAnswer}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {question.answerImageUrl && (
                <img src={question.answerImageUrl} alt={question.correctAnswer} className="w-8 h-8 rounded-full object-cover" />
              )}
              <span className="font-bold text-green-800 text-sm">{question.correctAnswer}</span>
            </div>
          )}
        </div>
      )}

      {/* Existing answers */}
      {question.answers.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {question.answers.map((a) => {
            const correct = question.isResolved && a.answer === question.correctAnswer;
            const wrong = question.isResolved && a.answer !== question.correctAnswer;

            return (
              <div
                key={a._id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${
                  correct
                    ? "bg-green-50 ring-2 ring-green-400"
                    : wrong
                      ? "bg-gray-50"
                      : "bg-gray-50"
                }`}
              >
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{a.playerId.name}</span>

                {question.type === "country" ? (
                  <>
                    <Flag countryName={a.answer} size={32} />
                    <span className={`text-xs font-medium ${wrong ? "text-gray-400 line-through" : "text-gray-700"}`}>
                      {a.answer}
                    </span>
                  </>
                ) : (
                  <>
                    {a.additionalData?.imageUrl ? (
                      <img
                        src={a.additionalData.imageUrl}
                        alt={a.answer}
                        className={`w-10 h-10 rounded-full object-cover ${wrong ? "opacity-40 grayscale" : ""}`}
                      />
                    ) : null}
                    <span className={`text-sm font-bold ${wrong ? "text-gray-400 line-through" : "text-gray-800"}`}>
                      {a.answer}
                    </span>
                    {a.additionalData?.goals !== undefined && (
                      <span className="text-xs text-gray-400">{a.additionalData.goals} įv.</span>
                    )}
                  </>
                )}

                {question.isResolved ? (
                  correct ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                      <X size={12} className="text-gray-400" />
                    </div>
                  )
                ) : (
                  <HelpCircle size={16} className="text-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Answer form for current user */}
      {canAnswer && (
        <div className="border-t border-gray-100 pt-3 flex items-center gap-2">
          {question.type === "country" ? (
            <select
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50"
            >
              <option value="">Pasirinkite šalį...</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Įveskite žaidėjo vardą..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50"
            />
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || (question.type === "country" ? !answer : !playerName)}
            className="p-2.5 bg-[var(--color-primary)] text-white rounded-xl cursor-pointer hover:bg-[var(--color-primary-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      )}

      {/* Already answered indicator */}
      {currentPlayerAnswered && !question.isResolved && (
        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Check size={13} />
          Jūs jau atsakėte
        </div>
      )}
    </div>
  );
}

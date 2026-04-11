import Flag from "../../components/Flag";
import type { SpecialQuestion } from "../../types";
import { Check, X, HelpCircle } from "lucide-react";

interface QuestionCardProps {
  question: SpecialQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 animate-fade-up">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-gray-900 text-sm">{question.question}</h3>
        <span className="text-xs font-bold text-[var(--color-accent)] bg-yellow-50 px-2.5 py-1 rounded-full shrink-0">
          +{question.pointValue}
        </span>
      </div>

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
    </div>
  );
}

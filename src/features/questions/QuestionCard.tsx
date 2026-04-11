import Flag from "../../components/Flag";
import type { SpecialQuestion } from "../../types";
import { Check, HelpCircle } from "lucide-react";

interface QuestionCardProps {
  question: SpecialQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">{question.question}</h3>
        <span className="text-xs font-bold text-[var(--color-accent)] bg-yellow-50 px-2 py-1 rounded-full">
          +{question.pointValue}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {question.answers.map((a) => {
          const correct = question.isResolved && a.answer === question.correctAnswer;
          const wrong = question.isResolved && a.answer !== question.correctAnswer;

          return (
            <div
              key={a._id}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center ${
                correct ? "bg-green-50 ring-2 ring-green-400" : wrong ? "bg-red-50 opacity-60" : "bg-gray-50"
              }`}
            >
              <span className="text-xs text-gray-500">{a.playerId.name}</span>
              {question.type === "country" ? (
                <Flag countryName={a.answer} size={32} />
              ) : (
                <span className="text-sm font-bold">{a.answer}</span>
              )}
              <span className="text-xs text-gray-600">{a.answer}</span>
              {a.additionalData?.goals !== undefined && (
                <span className="text-xs text-gray-400">{a.additionalData.goals} įv.</span>
              )}
              {question.isResolved ? (
                correct ? (
                  <Check size={14} className="text-green-600" />
                ) : null
              ) : (
                <HelpCircle size={14} className="text-gray-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

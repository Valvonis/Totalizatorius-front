import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchQuestions, createQuestion, resolveQuestion, updateAnswerPhoto, deleteQuestion } from "../questions/questionsSlice";
import { getCountryNames } from "../../utils/countries";
import { showToast } from "../../components/ui/Toast";
import { showConfirm } from "../../components/ui/ConfirmDialog";
import Flag from "../../components/Flag";
import FormInput from "../../components/ui/FormInput";
import FormSelect from "../../components/ui/FormSelect";
import InlineSaveCancel from "./InlineSaveCancel";
import { Plus, Check, HelpCircle, Award, Trash2 } from "lucide-react";

export default function QuestionManager({ leagueId }: { leagueId?: string | null }) {
  const dispatch = useAppDispatch();
  const tournament = useAppSelector((s) => s.tournament.active);
  const questions = useAppSelector((s) => s.questions.items);
  const countries = getCountryNames();

  // Question creation
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"country" | "player">("country");
  const [qPoints, setQPoints] = useState("10");

  // Question resolving
  const [resolvingQuestion, setResolvingQuestion] = useState<string | null>(null);
  const [resolveAnswer, setResolveAnswer] = useState("");
  const [resolveImageUrl, setResolveImageUrl] = useState("");

  // Answer photo editing
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !tournament) return;

    try {
      await dispatch(createQuestion({
        tournamentId: tournament._id,
        question: qText,
        type: qType,
        pointValue: Number(qPoints) || 10,
        leagueId: leagueId || undefined,
      })).unwrap();
      showToast("Klausimas sukurtas!", "success");
      setQText("");
      setQPoints("10");
    } catch {
      showToast("Nepavyko sukurti klausimo", "error");
    }
  };

  const handleUpdatePhoto = async (answerId: string) => {
    if (!photoUrl) return;
    try {
      await dispatch(updateAnswerPhoto({ answerId, imageUrl: photoUrl })).unwrap();
      showToast("Nuotrauka atnaujinta!", "success");
      setEditingPhoto(null);
      setPhotoUrl("");
      if (tournament) dispatch(fetchQuestions({ tournamentId: tournament._id, leagueId: leagueId || undefined }));
    } catch {
      showToast("Nepavyko atnaujinti nuotraukos", "error");
    }
  };

  const handleResolveQuestion = async (questionId: string) => {
    if (!resolveAnswer) return;
    if (!(await showConfirm({
      title: "Patvirtinti atsakymą",
      message: `Ar tikrai norite patvirtinti atsakymą "${resolveAnswer}"? Bus paskaičiuoti taškai.`,
      confirmText: "Patvirtinti",
      variant: "primary",
    }))) return;

    try {
      await dispatch(resolveQuestion({
        id: questionId,
        correctAnswer: resolveAnswer,
        answerImageUrl: resolveImageUrl || undefined,
      })).unwrap();
      showToast("Klausimas išspręstas!", "success");
      setResolvingQuestion(null);
      setResolveAnswer("");
      setResolveImageUrl("");
      if (tournament) dispatch(fetchQuestions({ tournamentId: tournament._id, leagueId: leagueId || undefined }));
    } catch {
      showToast("Nepavyko išspręsti klausimo", "error");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!(await showConfirm({
      title: "Ištrinti klausimą",
      message: "Ar tikrai norite ištrinti šį klausimą ir visus atsakymus?",
      confirmText: "Ištrinti",
      variant: "danger",
    }))) return;
    try {
      await dispatch(deleteQuestion(questionId)).unwrap();
      showToast("Klausimas ištrintas", "success");
    } catch {
      showToast("Nepavyko ištrinti klausimo", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <HelpCircle size={22} />
        Specialūs klausimai
      </h2>

      {/* Existing questions */}
      {questions.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          {questions.map((q) => (
            <div
              key={q._id}
              className={`p-4 rounded-xl ${q.isResolved ? "bg-green-50 ring-1 ring-green-300" : "bg-gray-50"}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.type === "country" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                    {q.type === "country" ? "Šalis" : "Žaidėjas"}
                  </span>
                  <span className="font-bold text-sm">{q.question}</span>
                  <span className="text-xs font-bold text-amber-950 bg-[var(--color-accent)] px-2 py-0.5 rounded-full">+{q.pointValue}</span>
                </div>
                {q.isResolved && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Check size={12} />
                    {q.correctAnswer}
                  </span>
                )}
              </div>

              {/* Answers from players */}
              {q.answers.length > 0 && (
                <div className="flex flex-col gap-2 mb-2">
                  {q.answers.map((a) => (
                    <div key={a._id} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg text-xs border border-gray-200">
                        {a.additionalData?.imageUrl && (
                          <img src={a.additionalData.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span className="text-gray-400">{a.playerId.name}:</span>
                        {q.type === "country" && <Flag countryName={a.answer} size={16} />}
                        <span className="font-medium">{a.answer}</span>
                        {a.points !== null && (
                          <span className={`font-bold ${a.points > 0 ? "text-green-600" : "text-gray-400"}`}>+{a.points}</span>
                        )}
                        {q.type === "player" && (
                          <button
                            onClick={() => { setEditingPhoto(a._id); setPhotoUrl(a.additionalData?.imageUrl || ""); }}
                            className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {a.additionalData?.imageUrl ? "Keisti foto" : "Pridėti foto"}
                          </button>
                        )}
                      </div>
                      {editingPhoto === a._id && (
                        <div className="flex items-center gap-2 ml-4">
                          <FormInput
                            type="url"
                            placeholder="Žaidėjo nuotraukos URL (https://...)"
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            compact
                            className="flex-1"
                          />
                          <InlineSaveCancel
                            onSave={() => handleUpdatePhoto(a._id)}
                            onCancel={() => { setEditingPhoto(null); setPhotoUrl(""); }}
                            iconSize={12}
                          />
                          {photoUrl && (
                            <img src={photoUrl} alt="Preview" className="w-6 h-6 rounded-full object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Resolve button */}
              {!q.isResolved && (
                resolvingQuestion === q._id ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      {q.type === "country" ? (
                        <FormSelect
                          value={resolveAnswer}
                          onChange={(e) => setResolveAnswer(e.target.value)}
                          compact
                          className="flex-1"
                        >
                          <option value="">Teisingas atsakymas...</option>
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </FormSelect>
                      ) : (
                        <FormInput
                          type="text"
                          placeholder="Teisingas atsakymas (žaidėjo vardas)"
                          value={resolveAnswer}
                          onChange={(e) => setResolveAnswer(e.target.value)}
                          compact
                          className="flex-1"
                        />
                      )}
                      <InlineSaveCancel
                        onSave={() => handleResolveQuestion(q._id)}
                        onCancel={() => { setResolvingQuestion(null); setResolveAnswer(""); setResolveImageUrl(""); }}
                        icon="check"
                      />
                    </div>
                    {q.type === "player" && (
                      <FormInput
                        type="url"
                        placeholder="Žaidėjo nuotraukos URL (neprivaloma)"
                        value={resolveImageUrl}
                        onChange={(e) => setResolveImageUrl(e.target.value)}
                        compact
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => setResolvingQuestion(q._id)}
                      className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
                    >
                      <Award size={13} />
                      Išspręsti klausimą
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Ištrinti
                    </button>
                  </div>
                )
              )}
              {/* Delete resolved question */}
              {q.isResolved && (
                <button
                  onClick={() => handleDeleteQuestion(q._id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 cursor-pointer mt-1"
                >
                  <Trash2 size={13} />
                  Ištrinti klausimą
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create new question */}
      <form onSubmit={handleCreateQuestion} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold text-gray-600">Naujas klausimas</h3>
        <FormInput
          type="text"
          placeholder="Klausimo tekstas (pvz. Kas laimės turnyrą?)"
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <FormSelect label="Tipas" value={qType} onChange={(e) => setQType(e.target.value as "country" | "player")}>
            <option value="country">Šalis (renkamasi iš sąrašo su vėliavomis)</option>
            <option value="player">Žaidėjas (įvedamas vardas)</option>
          </FormSelect>
          <FormInput label="Taškai" type="number" min={1} value={qPoints} onChange={(e) => setQPoints(e.target.value)} />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Sukurti klausimą
        </button>
      </form>
    </div>
  );
}

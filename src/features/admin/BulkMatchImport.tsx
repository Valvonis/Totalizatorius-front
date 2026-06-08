import { useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { createMatch } from "../matches/matchesSlice";
import { parseBulkMatches, type ParsedLineOk } from "./bulkImport";
import { formatMatchTime } from "../../utils/date";
import { showToast } from "../../components/ui/Toast";
import Flag from "../../components/Flag";
import { Upload, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function BulkMatchImport() {
  const dispatch = useAppDispatch();
  const tournament = useAppSelector((s) => s.tournament.active);
  const matches = useAppSelector((s) => s.matches.items);

  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);

  const parsed = useMemo(() => parseBulkMatches(text, matches), [text, matches]);
  const validLines = useMemo(() => parsed.filter((p): p is ParsedLineOk => p.ok), [parsed]);
  const errorLines = parsed.filter((p) => !p.ok);
  const warningCount = validLines.filter((p) => p.warning).length;

  const handleImport = async () => {
    if (!tournament || validLines.length === 0 || importing) return;
    setImporting(true);
    cancelRef.current = false;
    setProgress(0);

    const failed: ParsedLineOk[] = [];
    let created = 0;
    let stoppedAt = validLines.length;

    for (let i = 0; i < validLines.length; i++) {
      if (cancelRef.current) {
        stoppedAt = i;
        break;
      }
      setProgress(i + 1);
      try {
        await dispatch(createMatch({ tournamentId: tournament._id, ...validLines[i].match })).unwrap();
        created++;
      } catch {
        failed.push(validLines[i]);
      }
    }

    setImporting(false);

    // Keep unimported lines in the textarea so they can be fixed and retried.
    const leftover = [
      ...failed.map((l) => l.raw),
      ...validLines.slice(stoppedAt).map((l) => l.raw),
      ...errorLines.map((l) => l.raw),
    ];
    setText(leftover.join("\n"));

    if (created > 0 && leftover.length === 0) {
      showToast(`Importuota varžybų: ${created}`, "success");
    } else if (created > 0) {
      showToast(`Importuota: ${created}, liko neimportuota: ${leftover.length}`, "error");
    } else if (cancelRef.current) {
      showToast("Importavimas sustabdytas", "error");
    } else {
      showToast("Nepavyko importuoti varžybų", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        Viena eilutė — vienos varžybos: <span className="font-mono text-gray-600">data, komanda 1, komanda 2, etapas</span>.
        Stulpelius galima skirti kableliais, kabliataškiais arba tabuliacija (veikia įklijavimas iš Excel).
        Etapas neprivalomas — raidė A–L arba pavadinimas (pvz. Finalas).
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={importing}
        rows={8}
        spellCheck={false}
        placeholder={"2026-06-11 22:00, Meksika, Pietų Afrika, A\n2026-06-12 18:00; Kanada; Haitis; Grupė B"}
        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-y disabled:opacity-60"
      />

      {parsed.length > 0 && !importing && (
        <>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-green-700">
              <CheckCircle2 size={13} />
              Paruošta: {validLines.length}
            </span>
            {errorLines.length > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle size={13} />
                Klaidos: {errorLines.length}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertTriangle size={13} />
                Įspėjimai: {warningCount}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
            {parsed.map((p) =>
              p.ok ? (
                <div key={p.line} className="flex items-center gap-2 text-xs flex-wrap py-0.5">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <span className="text-gray-400 tabular-nums">{formatMatchTime(p.match.time)}</span>
                  <Flag countryName={p.match.team1} size={16} />
                  <span className="font-medium">{p.match.team1}</span>
                  <span className="text-gray-300">–</span>
                  <span className="font-medium">{p.match.team2}</span>
                  <Flag countryName={p.match.team2} size={16} />
                  {p.match.stage && (
                    <span className="text-[10px] font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded">
                      {p.match.stage}
                    </span>
                  )}
                  {p.warning && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertTriangle size={12} className="shrink-0" />
                      {p.warning}
                    </span>
                  )}
                </div>
              ) : (
                <div key={p.line} className="flex items-center gap-2 text-xs text-red-600 py-0.5">
                  <XCircle size={13} className="shrink-0" />
                  <span className="text-gray-400 shrink-0 tabular-nums">{p.line} eil.</span>
                  <span className="shrink-0">{p.error}</span>
                  <span className="text-gray-400 truncate">— {p.raw}</span>
                </div>
              )
            )}
          </div>
        </>
      )}

      {importing ? (
        <div className="flex items-center gap-3">
          <Loader2 size={16} className="animate-spin text-[var(--color-primary)] shrink-0" />
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all"
              style={{ width: `${(progress / Math.max(validLines.length, 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 tabular-nums shrink-0">
            {progress}/{validLines.length}
          </span>
          <button
            onClick={() => {
              cancelRef.current = true;
            }}
            className="text-xs text-red-600 hover:underline cursor-pointer shrink-0"
          >
            Stabdyti
          </button>
        </div>
      ) : (
        <>
          {validLines.length > 0 && errorLines.length > 0 && (
            <p className="text-xs text-red-600">Eilutės su klaidomis nebus importuotos — jos liks sąraše.</p>
          )}
          <button
            type="button"
            onClick={handleImport}
            disabled={validLines.length === 0 || !tournament}
            className="flex items-center justify-center gap-2 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            Importuoti ({validLines.length})
          </button>
        </>
      )}
    </div>
  );
}

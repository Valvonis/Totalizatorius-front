import { dayjs } from "../../utils/date";
import { ALL_STAGES, GROUP_STAGES } from "../matches/stages";
import { getCountryNames } from "../../utils/countries";

// Bulk match import: parses pasted text (one match per line) into createMatch payloads.
// Line format: date, team 1, team 2, optional stage — separated by tabs, semicolons
// or commas. The date may sit in any column; a "YYYY-MM-DD" column followed by a
// "HH:mm" column (typical spreadsheet paste) is merged automatically.

export type ParsedMatch = {
  team1: string;
  team2: string;
  time: string; // ISO string, ready for the backend
  stage?: string;
};

export type ParsedLineOk = { line: number; raw: string; ok: true; match: ParsedMatch; warning?: string };
export type ParsedLineError = { line: number; raw: string; ok: false; error: string };
export type ParsedLine = ParsedLineOk | ParsedLineError;

const DATETIME_RE = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})[T ]+(\d{1,2})[:.](\d{2})$/;
const DATE_ONLY_RE = /^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/;
const TIME_ONLY_RE = /^\d{1,2}:\d{2}$/;

/** Lowercase + strip diacritics, so "PRANCUZIJA" matches "Prancūzija". */
const norm = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const countryByNorm = new Map(getCountryNames().map((n) => [norm(n), n]));
const stageByNorm = new Map(ALL_STAGES.map((s) => [norm(s), s]));

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

/** Closest known country for a typo, if within 2 edits. */
function suggestCountry(input: string): string | null {
  const n = norm(input);
  let best: string | null = null;
  let bestDist = 3;
  for (const name of getCountryNames()) {
    const d = levenshtein(n, norm(name));
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

function unknownTeam(input: string): string {
  if (!input) return "Tuščias komandos stulpelis";
  const suggestion = suggestCountry(input);
  return suggestion ? `Nežinoma komanda: "${input}" (gal "${suggestion}"?)` : `Nežinoma komanda: "${input}"`;
}

/** Accepts an exact stage name (case/diacritic-insensitive) or a group letter A–L. */
function resolveStage(input: string): string | null {
  const n = norm(input);
  const exact = stageByNorm.get(n);
  if (exact) return exact;
  const letter = n.match(/^(?:grupe\s+)?([a-l])$/);
  if (letter) {
    const suffix = ` ${letter[1].toUpperCase()}`;
    return GROUP_STAGES.find((s) => s.endsWith(suffix)) ?? null;
  }
  return null;
}

/** Parses "2026-06-11 20:00" (also ./ separators, T, dot time) to an ISO string, rejecting impossible dates. */
function parseDateTime(value: string): string | null {
  const m = value.match(DATETIME_RE);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const date = new Date(y, mo - 1, d, h, mi);
  const valid =
    date.getFullYear() === y &&
    date.getMonth() === mo - 1 &&
    date.getDate() === d &&
    date.getHours() === h &&
    date.getMinutes() === mi;
  return valid ? date.toISOString() : null;
}

function splitFields(line: string): string[] {
  const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
  const fields = line.split(sep).map((f) => f.trim());
  while (fields.length && fields[fields.length - 1] === "") fields.pop();
  return fields;
}

/** Merges adjacent "YYYY-MM-DD" + "HH:mm" columns (spreadsheets keep date and time apart). */
function mergeDateTimeColumns(fields: string[]): string[] {
  for (let i = 0; i < fields.length - 1; i++) {
    if (DATE_ONLY_RE.test(fields[i]) && TIME_ONLY_RE.test(fields[i + 1])) {
      return [...fields.slice(0, i), `${fields[i]} ${fields[i + 1]}`, ...fields.slice(i + 2)];
    }
  }
  return fields;
}

/** Minute-precision key, team order ignored — for duplicate detection. */
const matchKey = (team1: string, team2: string, time: string) =>
  [...[team1, team2].sort(), dayjs(time).format("YYYY-MM-DDTHH:mm")].join("|");

export function parseBulkMatches(
  text: string,
  existing: { team1: string; team2: string; time: string }[] = []
): ParsedLine[] {
  const existingKeys = new Set(existing.map((m) => matchKey(m.team1, m.team2, m.time)));
  const seenKeys = new Set<string>();
  const result: ParsedLine[] = [];

  text.split("\n").forEach((rawLine, i) => {
    const raw = rawLine.trim();
    const line = i + 1;
    if (!raw || raw.startsWith("#")) return;

    const fields = mergeDateTimeColumns(splitFields(raw));
    const dateIdx = fields.findIndex((f) => DATETIME_RE.test(f));
    if (dateIdx === -1) {
      result.push({ line, raw, ok: false, error: "Nerasta data (pvz. 2026-06-11 20:00)" });
      return;
    }
    const time = parseDateTime(fields[dateIdx]);
    if (!time) {
      result.push({ line, raw, ok: false, error: `Neteisinga data: "${fields[dateIdx]}"` });
      return;
    }

    const rest = fields.filter((_, idx) => idx !== dateIdx);
    if (rest.length < 2) {
      result.push({ line, raw, ok: false, error: "Trūksta komandų (formatas: data, komanda 1, komanda 2, etapas)" });
      return;
    }
    if (rest.length > 3) {
      result.push({ line, raw, ok: false, error: "Per daug stulpelių (formatas: data, komanda 1, komanda 2, etapas)" });
      return;
    }

    const team1 = countryByNorm.get(norm(rest[0]));
    if (!team1) {
      result.push({ line, raw, ok: false, error: unknownTeam(rest[0]) });
      return;
    }
    const team2 = countryByNorm.get(norm(rest[1]));
    if (!team2) {
      result.push({ line, raw, ok: false, error: unknownTeam(rest[1]) });
      return;
    }
    if (team1 === team2) {
      result.push({ line, raw, ok: false, error: "Komandos negali būti vienodos" });
      return;
    }

    let stage: string | undefined;
    if (rest[2]) {
      const resolved = resolveStage(rest[2]);
      if (!resolved) {
        result.push({ line, raw, ok: false, error: `Nežinomas etapas: "${rest[2]}" (A–L arba pvz. Finalas)` });
        return;
      }
      stage = resolved;
    }

    const warnings: string[] = [];
    const key = matchKey(team1, team2, time);
    if (seenKeys.has(key)) warnings.push("dublikatas sąraše");
    else if (existingKeys.has(key)) warnings.push("tokios varžybos jau yra");
    seenKeys.add(key);
    if (dayjs(time).isBefore(dayjs())) warnings.push("laikas praeityje");

    result.push({
      line,
      raw,
      ok: true,
      match: { team1, team2, time, stage },
      warning: warnings.length ? warnings.join(", ") : undefined,
    });
  });

  return result;
}

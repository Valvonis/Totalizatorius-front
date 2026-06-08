import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Player } from "../../types";

// Above this many members, scanning a flat grid to find yourself gets painful,
// so we surface a search box. Small leagues (the original group) never see it.
const SEARCH_THRESHOLD = 12;

// Diacritic-insensitive so "jonas" finds "Jonáš" and Lithuanian names match loosely.
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

interface PlayerPickerProps {
  players: Player[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  // The player who last logged in on this device — floated to the front and
  // (by the parent) pre-selected, so returning on your own phone is one tap + PIN.
  lastSlug?: string | null;
}

export default function PlayerPicker({ players, selectedSlug, onSelect, lastSlug }: PlayerPickerProps) {
  const [query, setQuery] = useState("");
  const showSearch = players.length > SEARCH_THRESHOLD;

  // Remembered player first, everyone else in original order. Stable.
  const ordered = useMemo(() => {
    if (!lastSlug) return players;
    const idx = players.findIndex((p) => p.slug === lastSlug);
    if (idx <= 0) return players;
    const copy = players.slice();
    const [mine] = copy.splice(idx, 1);
    return [mine, ...copy];
  }, [players, lastSlug]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return ordered;
    return ordered.filter((p) => normalize(p.name).includes(q));
  }, [ordered, query]);

  return (
    <div className="flex flex-col gap-3">
      {showSearch && (
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Ieškoti vardo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Don't submit the surrounding login form; if the search narrows to a
                // single match, treat Enter as picking that person.
                e.preventDefault();
                if (filtered.length === 1) onSelect(filtered[0].slug);
              }
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 transition-colors focus:bg-white"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-3">Nieko nerasta</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => onSelect(p.slug)}
              className={`py-3.5 px-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                selectedSlug === p.slug
                  ? "bg-[var(--color-primary)] text-white shadow-lg scale-[1.03]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

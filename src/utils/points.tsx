import { Target, TrendingUp, Trophy, XCircle } from "lucide-react";

// Shared helpers for displaying prediction points (null = not scored yet, otherwise 0 / 1 / 3 / 5).

export function pointsColor(pts: number | null): string {
  if (pts === 5) return "text-[var(--color-points-5)]";
  if (pts === 3) return "text-[var(--color-points-3)]";
  if (pts === 1) return "text-[var(--color-points-1)]";
  if (pts === 0) return "text-[var(--color-points-0)]";
  return "text-[var(--card-text-muted)]";
}

export function pointsLabel(pts: number | null): string {
  if (pts === 5) return "Tikslus";
  if (pts === 3) return "Skirtumas";
  if (pts === 1) return "Nugalėtojas";
  if (pts === 0) return "Neteisingai";
  return "";
}

export function pointsLabelLong(pts: number | null): string {
  if (pts === 5) return "Tikslus rezultatas!";
  if (pts === 3) return "Teisingas skirtumas";
  if (pts === 1) return "Teisingas nugalėtojas";
  if (pts === 0) return "Neteisingas spėjimas";
  return "";
}

export function pointsBg(pts: number | null): string {
  if (pts === null) return "";
  if (pts === 5) return "bg-green-500/10";
  if (pts === 3) return "bg-blue-500/10";
  if (pts === 1) return "bg-orange-500/10";
  return "";
}

// Light badge classes (text + background) used in prediction history rows.
export function pointsBadgeClasses(pts: number | null): string {
  if (pts === 5) return "text-green-600 bg-green-50";
  if (pts === 3) return "text-blue-600 bg-blue-50";
  if (pts === 1) return "text-orange-500 bg-orange-50";
  if (pts === 0) return "text-gray-400 bg-gray-50";
  return "text-gray-300 bg-gray-50";
}

export function pointsIcon(pts: number | null, size = 13) {
  if (pts === 5) return <Target size={size} />;
  if (pts === 3) return <TrendingUp size={size} />;
  if (pts === 1) return <Trophy size={size} />;
  return <XCircle size={size} />;
}

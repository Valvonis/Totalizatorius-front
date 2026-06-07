import { Star, Crown } from "lucide-react";

// Single source of truth for tournament stages.

export const GROUP_STAGES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(
  (g) => `Grupė ${g}`
);

// Knockout stages in progression order (used for sorting and dropdowns).
export const KNOCKOUT_STAGES = [
  "Šešioliktfinalis",
  "Aštuntfinalis",
  "Ketvirtfinalis",
  "Pusfinalis",
  "3 vietos rungtynės",
  "Finalas",
];

export const ALL_STAGES = [...GROUP_STAGES, ...KNOCKOUT_STAGES];

export function isKnockout(stage: string): boolean {
  return KNOCKOUT_STAGES.includes(stage);
}

export type StageStyle = {
  border: string;
  glow: string;
  badge: string;
  scoreSize: string;
  icon: React.ReactNode | null;
};

export function getStageStyle(stage: string): StageStyle {
  if (stage === "Finalas") {
    return {
      border: "ring-2 ring-yellow-400 border-yellow-400/50",
      glow: "shadow-[0_0_20px_rgba(250,204,21,0.15)]",
      badge: "bg-yellow-400 text-yellow-900",
      scoreSize: "text-5xl",
      icon: <Crown size={16} className="text-yellow-900" />,
    };
  }
  if (stage === "Pusfinalis") {
    return {
      border: "ring-2 ring-yellow-400/60 border-yellow-400/30",
      glow: "shadow-[0_0_12px_rgba(250,204,21,0.1)]",
      badge: "bg-yellow-400/80 text-yellow-900",
      scoreSize: "text-5xl",
      icon: <Star size={14} className="text-yellow-900" />,
    };
  }
  if (stage === "3 vietos rungtynės") {
    return {
      border: "ring-1 ring-amber-600/40 border-amber-600/20",
      glow: "",
      badge: "bg-amber-600/80 text-white",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  if (stage === "Ketvirtfinalis") {
    return {
      border: "ring-1 ring-yellow-500/40 border-yellow-500/20",
      glow: "",
      badge: "bg-yellow-500/20 text-yellow-600",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  if (stage === "Aštuntfinalis") {
    return {
      border: "border-l-4 border-l-indigo-400 border-[var(--card-border)]",
      glow: "",
      badge: "bg-indigo-500/15 text-indigo-500",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  if (stage === "Šešioliktfinalis") {
    return {
      border: "border-l-[3px] border-l-blue-400 border-[var(--card-border)]",
      glow: "",
      badge: "bg-blue-500/15 text-blue-500",
      scoreSize: "text-4xl",
      icon: null,
    };
  }
  // Group stage — default
  return {
    border: "border border-[var(--card-border)]",
    glow: "",
    badge: "bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]",
    scoreSize: "text-4xl",
    icon: null,
  };
}

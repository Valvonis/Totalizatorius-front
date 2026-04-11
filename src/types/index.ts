export interface Player {
  id: string;
  name: string;
  slug: string;
  isAdmin: boolean;
}

export interface Tournament {
  _id: string;
  name: string;
  slug: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MatchPrediction {
  id: string;
  playerId: string;
  playerName: string;
  playerSlug: string;
  team1Goal: number;
  team2Goal: number;
  points: number | null;
}

export interface Match {
  _id: string;
  tournamentId: string;
  team1: string;
  team2: string;
  time: string;
  team1Score: number | null;
  team2Score: number | null;
  stage: string;
  predictions: MatchPrediction[];
}

export interface ScoreboardEntry {
  playerId: string;
  playerName: string;
  playerSlug: string;
  matchPoints: number;
  questionPoints: number;
  totalPoints: number;
}

export interface SpecialAnswer {
  _id: string;
  playerId: { _id: string; name: string; slug: string };
  answer: string;
  additionalData?: { player?: string; fullName?: string; goals?: number };
  points: number | null;
}

export interface SpecialQuestion {
  _id: string;
  tournamentId: string;
  question: string;
  type: "country" | "player";
  pointValue: number;
  correctAnswer: string | null;
  isResolved: boolean;
  answers: SpecialAnswer[];
}

export interface AuthState {
  token: string | null;
  player: Player | null;
  loading: boolean;
  error: string | null;
}

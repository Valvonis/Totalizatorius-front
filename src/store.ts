import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import matchesReducer from "./features/matches/matchesSlice";
import scoreboardReducer from "./features/scoreboard/scoreboardSlice";
import questionsReducer from "./features/questions/questionsSlice";
import tournamentReducer from "./features/tournaments/tournamentSlice";
import predictionsReducer from "./features/predictions/predictionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matches: matchesReducer,
    scoreboard: scoreboardReducer,
    questions: questionsReducer,
    tournament: tournamentReducer,
    predictions: predictionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

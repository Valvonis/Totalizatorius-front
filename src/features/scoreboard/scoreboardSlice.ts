import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { ScoreboardEntry } from "../../types";

interface ScoreboardState {
  entries: ScoreboardEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: ScoreboardState = {
  entries: [],
  loading: false,
  error: null,
};

export const fetchLeaderboard = createAsyncThunk(
  "scoreboard/fetch",
  async ({ tournamentId, silent }: { tournamentId?: string; silent?: boolean } = {}) => {
    const params = tournamentId ? { tournamentId } : {};
    const { data } = await api.get<ScoreboardEntry[]>("/leaderboard", { params });
    return { data, silent: !!silent };
  }
);

const scoreboardSlice = createSlice({
  name: "scoreboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        const newData = action.payload.data;
        if (JSON.stringify(state.entries) !== JSON.stringify(newData)) {
          state.entries = newData;
        }
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch leaderboard";
      });
  },
});

export default scoreboardSlice.reducer;

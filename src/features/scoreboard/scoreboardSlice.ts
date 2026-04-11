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
  async (tournamentId?: string) => {
    const params = tournamentId ? { tournamentId } : {};
    const { data } = await api.get<ScoreboardEntry[]>("/leaderboard", { params });
    return data;
  }
);

const scoreboardSlice = createSlice({
  name: "scoreboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch leaderboard";
      });
  },
});

export default scoreboardSlice.reducer;

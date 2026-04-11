import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { Tournament } from "../../types";

interface TournamentState {
  active: Tournament | null;
  loading: boolean;
  error: string | null;
}

const initialState: TournamentState = {
  active: null,
  loading: false,
  error: null,
};

export const fetchActiveTournament = createAsyncThunk(
  "tournament/fetchActive",
  async () => {
    const { data } = await api.get<Tournament>("/tournaments/active");
    return data;
  }
);

const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveTournament.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload;
      })
      .addCase(fetchActiveTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch tournament";
      });
  },
});

export default tournamentSlice.reducer;

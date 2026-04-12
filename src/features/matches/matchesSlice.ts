import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { Match } from "../../types";

interface MatchesState {
  items: Match[];
  loading: boolean;
  error: string | null;
}

const initialState: MatchesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchMatches = createAsyncThunk(
  "matches/fetchAll",
  async ({ tournamentId, silent }: { tournamentId?: string; silent?: boolean } = {}) => {
    const params = tournamentId ? { tournamentId } : {};
    const { data } = await api.get<Match[]>("/matches", { params });
    return { data, silent: !!silent };
  }
);

export const createMatch = createAsyncThunk(
  "matches/create",
  async (match: { tournamentId: string; team1: string; team2: string; time: string; stage?: string }) => {
    const { data } = await api.post<Match>("/matches", match);
    return data;
  }
);

export const updateMatch = createAsyncThunk(
  "matches/update",
  async ({ id, ...updates }: { id: string; team1?: string; team2?: string; time?: string; stage?: string; team1Score?: number; team2Score?: number }) => {
    const { data } = await api.patch<Match>(`/matches/${id}`, updates);
    return data;
  }
);

export const deleteMatch = createAsyncThunk(
  "matches/delete",
  async (id: string) => {
    await api.delete(`/matches/${id}`);
    return id;
  }
);

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state, action) => {
        // Only show loading spinner on initial load, not background refreshes
        if (!action.meta.arg?.silent) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        // Only update if data actually changed — prevents unnecessary re-renders
        const newData = action.payload.data;
        if (JSON.stringify(state.items) !== JSON.stringify(newData)) {
          state.items = newData;
        }
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch matches";
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateMatch.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteMatch.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload);
      });
  },
});

export default matchesSlice.reducer;

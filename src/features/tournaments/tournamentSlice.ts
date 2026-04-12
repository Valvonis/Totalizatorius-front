import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { Tournament } from "../../types";

interface TournamentState {
  active: Tournament | null;
  all: Tournament[];
  loading: boolean;
  error: string | null;
}

const initialState: TournamentState = {
  active: null,
  all: [],
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

export const fetchAllTournaments = createAsyncThunk(
  "tournament/fetchAll",
  async () => {
    const { data } = await api.get<Tournament[]>("/tournaments");
    return data;
  }
);

export const createTournament = createAsyncThunk(
  "tournament/create",
  async (tournament: { name: string; slug: string; logoUrl?: string; startDate: string; endDate: string; isActive: boolean }) => {
    const { data } = await api.post<Tournament>("/tournaments", tournament);
    return data;
  }
);

export const setActiveTournament = createAsyncThunk(
  "tournament/setActive",
  async (id: string) => {
    const { data } = await api.patch<Tournament>(`/tournaments/${id}`, { isActive: true });
    return data;
  }
);

export const updateTournamentLogo = createAsyncThunk(
  "tournament/updateLogo",
  async ({ id, logoUrl }: { id: string; logoUrl: string }) => {
    const { data } = await api.patch<Tournament>(`/tournaments/${id}`, { logoUrl });
    return data;
  }
);

export const deleteTournament = createAsyncThunk(
  "tournament/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tournaments/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to delete tournament");
    }
  }
);

const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {
    switchTournament(state, action) {
      state.active = state.all.find((t) => t._id === action.payload) ?? null;
    },
  },
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
      })
      .addCase(fetchAllTournaments.fulfilled, (state, action) => {
        state.all = action.payload;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.all.unshift(action.payload);
        if (action.payload.isActive) {
          state.active = action.payload;
          state.all = state.all.map((t) =>
            t._id === action.payload._id ? action.payload : { ...t, isActive: false }
          );
        }
      })
      .addCase(setActiveTournament.fulfilled, (state, action) => {
        state.active = action.payload;
        state.all = state.all.map((t) =>
          t._id === action.payload._id ? action.payload : { ...t, isActive: false }
        );
      })
      .addCase(updateTournamentLogo.fulfilled, (state, action) => {
        const updated = action.payload;
        state.all = state.all.map((t) => (t._id === updated._id ? updated : t));
        if (state.active?._id === updated._id) {
          state.active = updated;
        }
      })
      .addCase(deleteTournament.fulfilled, (state, action) => {
        state.all = state.all.filter((t) => t._id !== action.payload);
      });
  },
});

export const { switchTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer;

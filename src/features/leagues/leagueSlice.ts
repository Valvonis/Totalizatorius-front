import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { League } from "../../types";

// Admin-only slice — only ever dispatched from AdminPage, so it can never leak
// another league's data into the normal user-facing slices.
interface LeagueState {
  all: League[];
  manageLeagueId: string | null; // which league the super-admin is currently editing
  loading: boolean;
  error: string | null;
}

const initialState: LeagueState = {
  all: [],
  manageLeagueId: null,
  loading: false,
  error: null,
};

export const fetchLeagues = createAsyncThunk("leagues/fetchAll", async () => {
  const { data } = await api.get<League[]>("/leagues");
  return data;
});

export const createLeague = createAsyncThunk(
  "leagues/create",
  async (
    payload: { name: string; slug: string; tournamentId: string; joinPin: string; logoUrl?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<League>("/leagues", payload);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Nepavyko sukurti grupės");
    }
  }
);

export const updateLeague = createAsyncThunk(
  "leagues/update",
  async ({ id, ...body }: { id: string; name?: string; joinPin?: string; isActive?: boolean; logoUrl?: string }) => {
    const { data } = await api.patch<League>(`/leagues/${id}`, body);
    return data;
  }
);

export const deleteLeague = createAsyncThunk(
  "leagues/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/leagues/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Nepavyko ištrinti grupės");
    }
  }
);

const leagueSlice = createSlice({
  name: "leagues",
  initialState,
  reducers: {
    setManageLeague(state, action) {
      state.manageLeagueId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeagues.fulfilled, (state, action) => {
        state.all = action.payload;
      })
      .addCase(createLeague.fulfilled, (state, action) => {
        state.all.unshift(action.payload);
      })
      .addCase(updateLeague.fulfilled, (state, action) => {
        state.all = state.all.map((l) => (l._id === action.payload._id ? { ...l, ...action.payload } : l));
      })
      .addCase(deleteLeague.fulfilled, (state, action) => {
        state.all = state.all.filter((l) => l._id !== action.payload);
        if (state.manageLeagueId === action.payload) state.manageLeagueId = null;
      });
  },
});

export const { setManageLeague } = leagueSlice.actions;
export default leagueSlice.reducer;

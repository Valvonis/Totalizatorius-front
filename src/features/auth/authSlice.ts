import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { AuthState, Player, League } from "../../types";

const storedToken = localStorage.getItem("token");
const storedPlayer = localStorage.getItem("player");
const storedLeague = localStorage.getItem("league");

const initialState: AuthState = {
  token: storedToken,
  player: storedPlayer ? JSON.parse(storedPlayer) : null,
  league: storedLeague ? JSON.parse(storedLeague) : null,
  loading: false,
  error: null,
};

type AuthResponse = { token: string; player: Player; league: League | null };

function persistSession(data: { token?: string; player: Player; league: League | null }) {
  if (data.token) localStorage.setItem("token", data.token);
  localStorage.setItem("player", JSON.stringify(data.player));
  if (data.league) {
    localStorage.setItem("league", JSON.stringify(data.league));
    // Breadcrumb for the login screen after logout / token expiry: which group
    // this device last belonged to. Kept on logout on purpose, so each group
    // only ever sees its own players on /login — never the other group's.
    localStorage.setItem("lastLeagueSlug", data.league.slug);
  } else {
    localStorage.removeItem("league");
  }
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ slug, pin }: { slug: string; pin: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", { slug, pin });
      persistSession(data);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const joinLeague = createAsyncThunk(
  "auth/join",
  async (
    payload: { leagueSlug: string; leaguePin: string; name: string; pin: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/join", payload);
      persistSession(data);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Nepavyko prisijungti");
    }
  }
);

// Re-derives {player, league} from the server. Dispatched once on boot when a
// token exists, so stale localStorage (e.g. a session from before leagues) self-heals.
export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const { data } = await api.get<{ player: Player; league: League | null }>("/auth/me");
  persistSession(data);
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.player = null;
      state.league = null;
      localStorage.removeItem("token");
      localStorage.removeItem("player");
      localStorage.removeItem("league");
      // NOTE: "lastLeagueSlug" is intentionally kept so /login shows this group's
      // players (not the other group's) after logout. Do not remove it here.
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.player = action.payload.player;
        state.league = action.payload.league;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(joinLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.player = action.payload.player;
        state.league = action.payload.league;
      })
      .addCase(joinLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.player = action.payload.player;
        state.league = action.payload.league;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

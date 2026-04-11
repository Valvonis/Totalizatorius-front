import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { AuthState, Player } from "../../types";

const storedToken = localStorage.getItem("token");
const storedPlayer = localStorage.getItem("player");

const initialState: AuthState = {
  token: storedToken,
  player: storedPlayer ? JSON.parse(storedPlayer) : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ slug, pin }: { slug: string; pin: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ token: string; player: Player }>("/auth/login", { slug, pin });
      localStorage.setItem("token", data.token);
      localStorage.setItem("player", JSON.stringify(data.player));
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const { data } = await api.get("/auth/me");
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.player = null;
      localStorage.removeItem("token");
      localStorage.removeItem("player");
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

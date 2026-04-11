import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";

interface PredictionsState {
  loading: boolean;
  error: string | null;
}

const initialState: PredictionsState = {
  loading: false,
  error: null,
};

export const submitPrediction = createAsyncThunk(
  "predictions/submit",
  async (
    { matchId, team1Goal, team2Goal }: { matchId: string; team1Goal: number; team2Goal: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/predictions", { matchId, team1Goal, team2Goal });
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to submit prediction");
    }
  }
);

const predictionsSlice = createSlice({
  name: "predictions",
  initialState,
  reducers: {
    clearPredictionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitPrediction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPredictionError } = predictionsSlice.actions;
export default predictionsSlice.reducer;

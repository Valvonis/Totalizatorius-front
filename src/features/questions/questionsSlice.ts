import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { SpecialQuestion } from "../../types";

interface QuestionsState {
  items: SpecialQuestion[];
  loading: boolean;
  error: string | null;
}

const initialState: QuestionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchQuestions = createAsyncThunk(
  "questions/fetchAll",
  async (tournamentId?: string) => {
    const params = tournamentId ? { tournamentId } : {};
    const { data } = await api.get<SpecialQuestion[]>("/questions", { params });
    return data;
  }
);

export const submitAnswer = createAsyncThunk(
  "questions/submitAnswer",
  async (
    { questionId, answer, additionalData }: { questionId: string; answer: string; additionalData?: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/answers", { questionId, answer, additionalData });
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to submit answer");
    }
  }
);

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch questions";
      });
  },
});

export default questionsSlice.reducer;

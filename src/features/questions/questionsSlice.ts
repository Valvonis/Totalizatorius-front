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

export const createQuestion = createAsyncThunk(
  "questions/create",
  async (
    { tournamentId, question, type, pointValue }: { tournamentId: string; question: string; type: "country" | "player"; pointValue?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/questions", { tournamentId, question, type, pointValue });
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to create question");
    }
  }
);

export const resolveQuestion = createAsyncThunk(
  "questions/resolve",
  async (
    { id, correctAnswer }: { id: string; correctAnswer: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch(`/questions/${id}`, { correctAnswer });
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to resolve question");
    }
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
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.items.push({ ...action.payload, answers: [] });
      })
      .addCase(resolveQuestion.fulfilled, (state, action) => {
        const idx = state.items.findIndex((q) => q._id === action.payload._id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload };
        }
      });
  },
});

export default questionsSlice.reducer;

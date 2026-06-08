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
  async ({ tournamentId, leagueId, silent }: { tournamentId?: string; leagueId?: string; silent?: boolean } = {}) => {
    const params: Record<string, string> = {};
    if (tournamentId) params.tournamentId = tournamentId;
    if (leagueId) params.leagueId = leagueId; // super-admin only — honored server-side
    const { data } = await api.get<SpecialQuestion[]>("/questions", { params });
    return { data, silent: !!silent };
  }
);

export const createQuestion = createAsyncThunk(
  "questions/create",
  async (
    { tournamentId, question, type, pointValue, leagueId }: { tournamentId: string; question: string; type: "country" | "player"; pointValue?: number; leagueId?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/questions",
        { tournamentId, question, type, pointValue },
        { params: leagueId ? { leagueId } : {} }
      );
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
    { id, correctAnswer, answerImageUrl }: { id: string; correctAnswer: string; answerImageUrl?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch(`/questions/${id}`, { correctAnswer, answerImageUrl });
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to resolve question");
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/delete",
  async (id: string) => {
    await api.delete(`/questions/${id}`);
    return id;
  }
);

export const updateAnswerPhoto = createAsyncThunk(
  "questions/updateAnswerPhoto",
  async (
    { answerId, imageUrl }: { answerId: string; imageUrl: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch(`/answers/${answerId}`, { additionalData: { imageUrl } });
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to update photo");
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
      .addCase(fetchQuestions.pending, (state, action) => {
        if (!action.meta.arg?.silent) {
          state.loading = true;
        }
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        const newData = action.payload.data;
        if (JSON.stringify(state.items) !== JSON.stringify(newData)) {
          state.items = newData;
        }
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
          state.items[idx].correctAnswer = action.payload.correctAnswer;
          state.items[idx].answerImageUrl = action.payload.answerImageUrl;
          state.items[idx].isResolved = action.payload.isResolved;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q._id !== action.payload);
      });
  },
});

export default questionsSlice.reducer;

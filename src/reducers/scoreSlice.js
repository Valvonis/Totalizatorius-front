import { createSlice } from "@reduxjs/toolkit";

export const scoreSlice = createSlice({
  name: "score",
  initialState: {
    ValdasScore: 0,
    ArnasScore: 0,
    DautartasScore: 0,
  },
  reducers: {
    addValdas: (state, action) => {
      state.ValdasScore += action.payload;
    },
    addArnas: (state, action) => {
      state.ArnasScore += action.payload;
    },
    addDautartas: (state, action) => {
      state.DautartasScore += action.payload;
    },
  },
});

export default scoreSlice.reducer;

export const selectValdasScore = (state) => state.score.ValdasScore;
export const selectArnasScore = (state) => state.score.ArnasScore;
export const selectDautartasScore = (state) => state.score.DautartasScore;

export const { addValdas, addArnas, addDautartas } = scoreSlice.actions;

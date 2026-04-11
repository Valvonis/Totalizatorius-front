import { createSlice } from "@reduxjs/toolkit";

export const modalSlice = createSlice({
  name: "modal",
  initialState: {
    isOpen: false,
    matchId: null,
  },
  reducers: {
    setOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setMatchId: (state, action) => {
      state.matchId = action.payload;
    },
  },
});

export default modalSlice.reducer;

export const selectIsOpen = (state) => state.modal.isOpen;

export const selectMatchId = (state) => state.modal.matchId;

export const { setOpen, setMatchId } = modalSlice.actions;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  candidates: [],
  loading: false,
  error: null,
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.candidates = action.payload;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addCandidate: (state, action) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action) => {
      const index = state.candidates.findIndex(
        (c) => c._id === action.payload._id,
      );
      if (index !== -1) {
        state.candidates[index] = action.payload;
      }
    },
    deleteCandidate: (state, action) => {
      state.candidates = state.candidates.filter(
        (c) => c._id !== action.payload,
      );
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} = candidateSlice.actions;
export default candidateSlice.reducer;

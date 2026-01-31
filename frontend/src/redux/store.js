import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import candidateReducer from "./candidateSlice";
import adminReducer from "../store/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidates: candidateReducer,
    admin: adminReducer,
  },
});

export default store;

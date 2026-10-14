import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";

const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
});

const initialState = {
  loadingStatus: STATUS.IDLE,
  loading: false,
  bodyClass: "page-body",
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    changeBodyClass(state, { payload }) {
      state.bodyClass = payload;
    },
  },
});

export const { setLoading, changeBodyClass } = loadingSlice.actions;

export default loadingSlice.reducer;

export function callSetLoading(status: boolean) {
  return async function loadingThunk(dispatch: AppDispatch) {
    try {
      dispatch(setLoading(status));
    } catch (err) {}
  };
}

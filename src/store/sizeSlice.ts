import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import {
  addSize,
  deleteSize,
  getAllSizes,
  updateSize,
} from "@/shared/_services/api_services";
import axios from "axios";

const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
});

export interface SIZE {
  _id: string;
  name: string;
  minAge: number;
  maxAge: number;
  ageUnit: "month" | "year";
  description: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface SizeState {
  sizes: SIZE[];
  total: number;
  status: string;
  error: string | null;
}

const initialState: SizeState = {
  sizes: [],
  total: 0,
  status: STATUS.IDLE,
  error: null,
};

const sizeSlice = createSlice({
  name: "size",
  initialState,
  reducers: {
    setSizes: (state, { payload }) => {
      state.sizes = payload;
    },
    setTotal: (state, { payload }) => {
      state.total = payload;
    },
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
    appendSizes: (state, { payload }) => {
      const newItems: SIZE[] =
        payload?.result || (Array.isArray(payload) ? payload : []);
      state.sizes = [...state.sizes, ...newItems];
      if (payload?.total !== undefined) {
        state.total = payload.total;
      }
    },
    addSizeSuccess: (state, { payload }) => {
      state.sizes = [payload, ...state.sizes];
      state.total += 1;
    },
    updateSizeSuccess: (state, { payload }) => {
      state.sizes = state.sizes.map((size) =>
        size._id === payload._id ? payload : size,
      );
    },
    deleteSizeSuccess: (state, { payload }) => {
      state.sizes = state.sizes.filter((size) => size._id !== payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setSizes,
  appendSizes,
  setTotal,
  setStatus,
  setError,
  addSizeSuccess,
  updateSizeSuccess,
  deleteSizeSuccess,
} = sizeSlice.actions;

export default sizeSlice.reducer;

// Thunks
// Get all size thunks
export function getAllSizeThunk(
  params?: {
    offset?: number;
    limit?: number;
    query?: string;
    sort?: "asc" | "desc";
  },
  signal?: AbortSignal
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await getAllSizes(params, signal);
      if (params?.offset && params.offset > 0) {
        dispatch(appendSizes(res.data));
      } else {
        dispatch(setSizes(res.data.result));
        dispatch(setTotal(res.data.total));
      }
      dispatch(setStatus(STATUS.IDLE));
    } catch (error: any) {
      // manual aborts
      if (axios.isCancel(error) || error?.name === "CanceledError") return;

      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);
    }
  };
}

// Add size thunk
export function addSizeThunk(data: object) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await addSize(data);
      const created = res?.data?.result ?? res?.data;
      dispatch(addSizeSuccess(created));
      dispatch(setStatus(STATUS.IDLE));
      successHandler("Size added successfully");
      return true;
    } catch (error: any) {
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);
      return false;
    }
  };
}

// Update size thunk
export function updateSizeThunk(id: string, data: object) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await updateSize(id, data);
      const updated = res?.data?.result ?? res?.data;
      dispatch(updateSizeSuccess(updated));
      dispatch(setStatus(STATUS.IDLE));
      successHandler("Size updated successfully");
      return true;
    } catch (error: any) {
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);
      return false;
    }
  };
}

// Delete size thunk
export function deleteSizeThunk(id: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      await deleteSize(id);
      dispatch(deleteSizeSuccess(id));
      dispatch(setStatus(STATUS.IDLE));
      successHandler("Size deleted successfully");
      return true;
    } catch (error: any) {
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);
      return false;
    }
  };
}

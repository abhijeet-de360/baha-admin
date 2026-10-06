import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import {
  addColor,
  getAllColors,
  updateColor,
  deleteColor,
} from "@/shared/_services/api_services";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";

export interface ColorItem {
  _id: string;
  name: string;
  slug: string;
  hexCode: string;
  status: "active" | "inactive" | "deleted";
  createdAt?: string;
  updatedAt?: string;
}

interface ColorState {
  colors: ColorItem[];
  total: number;
  loading: boolean;
  error: any;
}

const initialState: ColorState = {
  colors: [],
  total: 0,
  loading: false,
  error: null,
};

const colorSlice = createSlice({
  name: "color",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setColors: (state, action) => {
      if (action.payload?.colors) {
        state.colors = action.payload.colors;
        state.total = action.payload.totalColors ?? action.payload.colors.length;
      } else if (Array.isArray(action.payload)) {
        state.colors = action.payload;
        state.total = action.payload.length;
      } else {
        state.colors = [];
        state.total = 0;
      }
    },
    appendColors: (state, { payload }) => {
      const newItems: ColorItem[] =
        payload?.colors || (Array.isArray(payload) ? payload : []);
      state.colors = [...state.colors, ...newItems];
      if (payload?.totalColors !== undefined) {
        state.total = payload.totalColors;
      }
    },
    addColorSuccess: (state, action) => {
      state.colors = [action.payload, ...state.colors];
      state.total += 1;
    },
    updateColorSuccess: (state, action) => {
      state.colors = state.colors.map((c) =>
        c._id === action.payload._id ? action.payload : c
      );
    },
    deleteColorSuccess: (state, action) => {
      state.colors = state.colors.filter((c) => c._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setLoading,
  setError,
  setColors,
  appendColors,
  addColorSuccess,
  updateColorSuccess,
  deleteColorSuccess,
} = colorSlice.actions;

export default colorSlice.reducer;

// Color thunk function - Add
export function addColorThunk(data: object, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const res = await addColor(data);
      if (res.status === 200 || res.status === 201) {
        dispatch(addColorSuccess(res.data));
        dispatch(setError(null));
        successHandler("Color added successfully.");
        if (onSuccess) onSuccess();
        return true;
      }
    } catch (err: any) {
      console.log("add color err : ", err);
      dispatch(setError(err));
      errorHandler(err?.response || err);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Color thunk function - Update
export function updateColorThunk(
  id: string,
  data: object,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const res = await updateColor(id, data);
      if (res.status === 200 || res.status === 201) {
        dispatch(updateColorSuccess(res.data));
        dispatch(setError(null));
        successHandler("Color updated successfully.");
        if (onSuccess) onSuccess();
        return true;
      }
    } catch (err: any) {
      console.log("update color err : ", err);
      dispatch(setError(err));
      errorHandler(err?.response || err);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Color thunk function - Delete
export function deleteColorThunk(id: string, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const res = await deleteColor(id);
      if (res.status === 200 || res.status === 201) {
        dispatch(deleteColorSuccess(id));
        dispatch(setError(null));
        successHandler("Color deleted successfully.");
        if (onSuccess) onSuccess();
        return true;
      }
    } catch (err: any) {
      console.log("delete color err : ", err);
      dispatch(setError(err));
      errorHandler(err?.response || err);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Get all colors thunk function
export function getColorsThunk(params: {
  offset?: number;
  limit?: number;
  status?: string;
  query?: string;
  sort?: "asc" | "desc";
  sortBy?: "name" | "hexCode" | "createdAt" | "updatedAt";
}) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const res = await getAllColors(params);
      if (res.status === 200) {
        if (params.offset && params.offset > 0) {
          dispatch(appendColors(res.data));
        } else {
          dispatch(setColors(res.data));
        }
        dispatch(setError(null));
      }
    } catch (err: any) {
      console.log("get colors err : ", err);
      dispatch(setError(err));
      errorHandler(err?.response || err);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

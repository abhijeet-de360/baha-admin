import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { service } from "@/shared/_services/api_services";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import { setLoading } from "./loader";

export const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
} as const);

export type ColorStatus = (typeof STATUS)[keyof typeof STATUS];

export interface ColorItem {
  _id: string;
  name: string;
  slug: string;
  hexCode: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

interface ColorState {
  status: ColorStatus;
  colors: ColorItem[];
  total: number;
  isModalOpen: boolean;
}

const initialState: ColorState = {
  status: STATUS.IDLE as ColorStatus,
  colors: [],
  total: 0,
  isModalOpen: false,
};

const colorSlice = createSlice({
  name: "color",
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setColors: (state, action) => {
      if (action.payload?.colors) {
        state.colors = action.payload.colors;
        state.total =
          action.payload.totalColors ?? action.payload.colors.length;
      } else if (Array.isArray(action.payload)) {
        state.colors = action.payload;
        state.total = action.payload.length;
      } else {
        state.colors = [];
        state.total = 0;
      }
    },
    appendColors: (state, { payload }) => {
      const newItems =
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
        c._id === action.payload._id ? action.payload : c,
      );
    },
    deleteColorSuccess: (state, action) => {
      state.colors = state.colors.filter((c) => c._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    toogleModal: (state, { payload }) => {
      state.isModalOpen = payload;
    },
  },
});

export const {
  setStatus,
  setColors,
  appendColors,
  addColorSuccess,
  updateColorSuccess,
  deleteColorSuccess,
  toogleModal,
} = colorSlice.actions;

export default colorSlice.reducer;

// Color thunk function - Add
export function addColor(data: object) {
  return async function addColorThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .addColor(data)
      .then((res) => {
        dispatch(addColorSuccess(res.data));
        dispatch(toogleModal(false));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Color added successfully.");
      })
      .catch((err: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err?.response || err);
        return false;
      });
  };
}

// Color thunk function - Update
export function updateColor(id: string, data: object) {
  return async function updateColorThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .updateColor(id, data)
      .then((res) => {
        dispatch(updateColorSuccess(res.data));
        dispatch(toogleModal(false));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Color updated successfully.");
      })
      .catch((err: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err?.response || err);
      });
  };
}

// Color thunk function - Delete
export function deleteColor(id: string) {
  return async function deleteColorThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .deleteColor(id)
      .then(() => {
        dispatch(deleteColorSuccess(id));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Color deleted successfully.");
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response || error);
      });
  };
}

// Get all colors thunk function
export function getColors(
  keyword: string,
  limit: number,
  offset: number,
  status: string,
) {
  return async function getColorsThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .getAllColors(keyword, limit, offset, status)
      .then((res) => {
        if (offset > 0) {
          dispatch(appendColors(res.data));
        } else {
          dispatch(setColors(res.data));
        }
        dispatch(setStatus(STATUS.IDLE));
        dispatch(setLoading(false));
      })
      .catch((err: any) => {
        dispatch(setStatus(STATUS.ERROR));
        dispatch(setLoading(false));
        errorHandler(err?.response || err);
      });
  };
}

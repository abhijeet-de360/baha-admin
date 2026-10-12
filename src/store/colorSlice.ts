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
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setColors: (state, { payload }) => {
      if (payload?.colors) {
        state.colors = payload.colors;
        state.total = payload.totalColors ?? payload.colors.length;
      } else if (Array.isArray(payload)) {
        state.colors = payload;
        state.total = payload.length;
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
    addColorSuccess: (state, { payload }) => {
      state.colors = [payload, ...state.colors];
      state.total += 1;
    },
    updateColorSuccess: (state, { payload }) => {
      state.colors = state.colors.map((c) =>
        c._id === payload._id ? payload : c,
      );
    },
    deleteColorSuccess: (state, { payload }) => {
      state.colors = state.colors.filter((c) => c._id !== payload);
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
    dispatch(setLoading(true));
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
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Color thunk function - Update
export function updateColor(id: string, data: object) {
  return async function updateColorThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
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
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Color thunk function - Delete
export function deleteColor(id: string) {
  return async function deleteColorThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
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
      })
      .finally(() => {
        dispatch(setLoading(false));
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
      })
      .catch((err: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err?.response || err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import { service } from "@/shared/_services/api_services";
import { setLoading } from "./loader";

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
  isAddModalOpen: boolean;
}

const initialState: SizeState = {
  sizes: [],
  total: 0,
  status: STATUS.IDLE,
  isAddModalOpen: false,
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
    toogleAddModal: (state, {payload}) => {
      state.isAddModalOpen = payload;
    },
  },
});

export const {
  setSizes,
  appendSizes,
  setTotal,
  setStatus,
  addSizeSuccess,
  updateSizeSuccess,
  deleteSizeSuccess,
  toogleAddModal,
} = sizeSlice.actions;

export default sizeSlice.reducer;

// Thunks
// Get all size thunks
export function getAllSize( keyword: string, limit: number, offset: number, status: string) {
  return async function getAllSizeThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .getAllSizes(keyword, limit, offset, status)
      .then((res) => {
        if (offset > 0) {
          dispatch(appendSizes(res.data));
        } else {
          dispatch(setSizes(res.data.result));
          dispatch(setTotal(res.data.total));
        }
        dispatch(setStatus(STATUS.IDLE));
        dispatch(setLoading(false));
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        dispatch(setLoading(false));
        errorHandler(error?.response);
      });
  };
}

// Add size thunk
export function addSize(data: object) {
  return async function addSizeThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .addSize(data)
      .then((res) => {
        const created = res?.data?.result ?? res?.data;
        dispatch(addSizeSuccess(created));
        dispatch(toogleAddModal(false))
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Size added successfully");
        return true;
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
        return false;
      });
  };
}

// Update size thunk
export function updateSize(id: string, data: object) {
  return async function updateSizeThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .updateSize(id, data)
      .then((res) => {
        const updated = res?.data?.result ?? res?.data;
        dispatch(toogleAddModal(false))
        dispatch(updateSizeSuccess(updated));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Size updated successfully");
        return true;
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
        return false;
      });
  };
}

// Delete size thunk
export function deleteSize(id: string) {
  return async function deleteSizeThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .deleteSize(id)
      .then(() => {
        dispatch(deleteSizeSuccess(id));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Size deleted successfully");
        return true;
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
        return false;
      });
  };
}

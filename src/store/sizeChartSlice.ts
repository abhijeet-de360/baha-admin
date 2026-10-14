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

export interface SIZE_CHART_ROW {
  size: {
    _id: string;
    name: string;
    minAge: number;
    maxAge: number;
    ageUnit: "month" | "year";
  };
  height?: {
    min: number;
    max: number;
  };
  chest?: {
    min: number;
    max: number;
  };
  waist?: {
    min: number;
    max: number;
  };
}

export interface SIZE_CHART {
  _id?: string;
  name: string;
  description: string;
  rows?: SIZE_CHART_ROW[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SizeChartState {
  sizeCharts: SIZE_CHART[];
  total: number;
  status: string;
  isAddModalOpen: boolean;
}

const initialState: SizeChartState = {
  sizeCharts: [],
  total: 0,
  status: STATUS.IDLE,
  isAddModalOpen: false,
};

const sizeChartSlice = createSlice({
  name: "sizeChart",
  initialState,
  reducers: {
    setSizeCharts: (state, { payload }) => {
      state.sizeCharts = payload.sizeCharts;
      state.total = payload.total;
    },

    setStatus: (state, { payload }) => {
      state.status = payload;
    },

    appendSizeCharts: (state, { payload }) => {
      const newItems: SIZE_CHART[] =
        payload?.sizeCharts || payload?.result || (Array.isArray(payload) ? payload : []);

      state.sizeCharts = [...state.sizeCharts, ...newItems];

      if (payload?.total !== undefined) {
        state.total = payload.total;
      }
    },

    addSizeChartSuccess: (state, { payload }) => {
      state.sizeCharts = [payload, ...state.sizeCharts];
      state.total += 1;
    },

    updateSizeChartSuccess: (state, { payload }) => {
      state.sizeCharts = state.sizeCharts.map((sizeChart) =>
        sizeChart._id === payload._id ? payload : sizeChart,
      );
    },

    deleteSizeChartSuccess: (state, { payload }) => {
      state.sizeCharts = state.sizeCharts.filter(
        (sizeChart) => sizeChart._id !== payload,
      );

      state.total = Math.max(0, state.total - 1);
    },

    toogleAddModal: (state, { payload }) => {
      state.isAddModalOpen = payload;
    },
  },
});

export const {
  setSizeCharts,
  appendSizeCharts,
  setStatus,
  addSizeChartSuccess,
  updateSizeChartSuccess,
  deleteSizeChartSuccess,
  toogleAddModal,
} = sizeChartSlice.actions;

export default sizeChartSlice.reducer;

// Thunks

// Get all size charts thunk
export function getAllSizeCharts(
  keyword: string,
  limit: number,
  offset: number,
) {
  return async function getAllSizeChartsThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    return await service
      .getAllSizeCharts(keyword, limit, offset)
      .then((res) => {
        if (offset > 0) {
          dispatch(appendSizeCharts(res.data));
        } else {
          dispatch(setSizeCharts(res.data));
        }

        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Add size chart thunk
export function addSizeChart(data: object) {
  return async function addSizeChartThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    return await service
      .addSizeChart(data)
      .then((res) => {
        const created = res?.data?.result ?? res?.data;

        dispatch(addSizeChartSuccess(created));
        dispatch(toogleAddModal(false));
        dispatch(setStatus(STATUS.IDLE));

        successHandler("Size chart added successfully");
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Update size chart thunk
export function updateSizeChart(id: string, data: object) {
  return async function updateSizeChartThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    return await service
      .updateSizeChart(id, data)
      .then((res) => {
        const updated = res?.data?.result ?? res?.data;

        dispatch(toogleAddModal(false));
        dispatch(updateSizeChartSuccess(updated));
        dispatch(setStatus(STATUS.IDLE));

        successHandler("Size chart updated successfully");
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Delete size chart thunk
export function deleteSizeChart(id: string) {
  return async function deleteSizeChartThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    return await service
      .deleteSizeChart(id)
      .then(() => {
        dispatch(deleteSizeChartSuccess(id));
        dispatch(setStatus(STATUS.IDLE));

        successHandler("Size chart deleted successfully");
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

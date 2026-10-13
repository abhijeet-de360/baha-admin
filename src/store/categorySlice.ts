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

export type CategoryStatus = (typeof STATUS)[keyof typeof STATUS];

export interface CategoryItem {
  _id?: string;
  slug: string;
  name: string;
  priority?: number;
  status?: "active" | "inactive";
  image?: string | File;
  createdAt?: string;
}

interface CategoryState {
  status: CategoryStatus;
  categories: CategoryItem[];
  total: number;
  isModalOpen: boolean;
}

const initialState: CategoryState = {
  status: STATUS.IDLE as CategoryStatus,
  categories: [],
  total: 0,
  isModalOpen: false,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setCategories: (state, { payload }) => {
      state.categories = payload.result;
      state.total = payload.total;
    },
    appendCategories: (state, { payload }) => {
      const newItems = payload?.result || [];
      state.categories = [...state.categories, ...newItems];
      if (payload?.total !== undefined) {
        state.total = payload.total;
      }
    },
    addCategorySuccess: (state, { payload }) => {
      state.categories = [payload, ...state.categories];
      state.total += 1;
    },
    updateCategorySuccess: (state, { payload }) => {
      state.categories = state.categories.map((c) =>
        c._id === payload._id ? payload : c,
      );
    },
    deleteCategorySuccess: (state, { payload }) => {
      state.categories = state.categories.filter((c) => c._id !== payload);
      state.total = Math.max(0, state.total - 1);
    },
    toogleModal: (state, { payload }) => {
      state.isModalOpen = payload;
    },
  },
});

export const {
  setStatus,
  setCategories,
  appendCategories,
  addCategorySuccess,
  updateCategorySuccess,
  deleteCategorySuccess,
  toogleModal,
} = categorySlice.actions;

export default categorySlice.reducer;

// Category thunk function
export function getAllCategories(
  keyword: string,
  limit: number,
  offset: number,
  status: string,
) {
  return async function getAllCategoriesThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .getAllCategories(keyword, limit, offset, status)
      .then((res) => {
        if (offset > 0) {
          dispatch(appendCategories(res.data));
        } else {
          dispatch(setCategories(res.data));
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

// Add category thunk
export function addCategory(data: FormData) {
  return async function addCategoryThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .addCategory(data)
      .then((res) => {
        const created = res?.data?.result ?? res?.data;
        dispatch(addCategorySuccess(created));
        dispatch(toogleModal(false));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Category added successfully");
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

export function updateCategory(id: string, data: FormData) {
  return async function updateCategoryThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .updateCategory(id, data)
      .then((res) => {
        const updated = res?.data?.result ?? res?.data;
        dispatch(updateCategorySuccess(updated));
        dispatch(toogleModal(false));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Category updated successfully");
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

// Delete category thunk
export function deleteCategory(id: string) {
  return async function deleteCategoryThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    return await service
      .deleteCategory(id)
      .then((res) => {
        dispatch(deleteCategorySuccess(id));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Category deleted successfully");
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

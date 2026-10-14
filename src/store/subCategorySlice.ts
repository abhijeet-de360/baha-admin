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

export type SubCategoryStatus = (typeof STATUS)[keyof typeof STATUS];

export interface SubCategoryItem {
  _id?: string;
  slug: string;
  name: string;
  status?: "active" | "inactive";
  category: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubCategoryState {
  subCategories: SubCategoryItem[];
  status: SubCategoryStatus;
  error: any;
  total: number;
  isModalOpen: boolean;
}

const initialState: SubCategoryState = {
  subCategories: [],
  status: STATUS.IDLE,
  error: null,
  total: 0,
  isModalOpen: false,
};

const subCategorySlice = createSlice({
  name: "subCategory",
  initialState,
  reducers: {
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setSubCategories: (state, { payload }) => {
      state.subCategories = payload?.result || [];
      state.total = payload?.total || 0;
    },
    appendSubCategories: (state, { payload }) => {
      state.subCategories = [...state.subCategories, ...(payload || [])];
    },
    addSubCategorySuccess: (state, { payload }) => {
      state.subCategories = [payload, ...state.subCategories];
      state.total += 1;
    },
    updateSubCategorySuccess: (state, { payload }) => {
      state.subCategories = state.subCategories.map((c) =>
        c._id === payload._id ? payload : c,
      );
    },
    deleteSubCategorySuccess: (state, { payload }) => {
      state.subCategories = state.subCategories.filter(
        (c) => c._id !== payload,
      );
      state.total = Math.max(0, state.total - 1);
    },
    toogleModal: (state, { payload }) => {
      state.isModalOpen = payload;
    },
  },
});

export const {
  setStatus,
  setSubCategories,
  appendSubCategories,
  addSubCategorySuccess,
  updateSubCategorySuccess,
  deleteSubCategorySuccess,
  toogleModal,
} = subCategorySlice.actions;

export default subCategorySlice.reducer;

export function getAllSubCategories(
  keyword?: string,
  limit?: number,
  offset?: number,
  status?: string,
  categoryId?: string,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setStatus(STATUS.LOADING));
      const response = await service.getAllSubCategories(
        keyword,
        limit,
        offset,
        status,
        categoryId,
      );
      if (response?.status) {
        dispatch(setSubCategories(response.data));
        dispatch(setStatus(STATUS.IDLE));
        dispatch(setLoading(false));
      } else {
        dispatch(setSubCategories([]));
        dispatch(setStatus(STATUS.ERROR));
        dispatch(setLoading(false));
      }
    } catch (error) {
      dispatch(setSubCategories([]));
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setLoading(false));
      errorHandler(error);
    }
  };
}

export function addSubCategory(data: object) {
  return async function addSubCategoryThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .addSubCategory(data)
      .then((res) => {
        dispatch(addSubCategorySuccess(res.data));
        dispatch(toogleModal(false));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Sub category added successfully");
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

export function updateSubCategory(id: string, data: object) {
  return async function updateSubCategoryThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .updateSubCategory(id, data)
      .then((res) => {
        dispatch(updateSubCategorySuccess(res.data));
        dispatch(toogleModal(false));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Sub category updated successfully");
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

export function deleteSubCategory(id: string) {
  return async function deleteSubCategoryThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .deleteSubCategory(id)
      .then((res: any) => {
        dispatch(deleteSubCategorySuccess(id));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Sub category deleted successfully");
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

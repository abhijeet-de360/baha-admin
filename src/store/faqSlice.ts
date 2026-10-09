import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import { service } from "@/shared/_services/api_services";
import axios from "axios";
import { setLoading } from "./loader";

const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
});

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  status: "active" | "inactive";
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface InitialState {
  faqs: FAQ[];
  total: number;
  status: string;
}

const initialState: InitialState = {
  faqs: [],
  total: 0,
  status: STATUS.IDLE,
};

export const faqSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {
    setStatus(state, { payload }) {
      state.status = payload;
    },
    setTotal(state, { payload }) {
      state.total = payload;
    },
    setFaqs(state, { payload }) {
      state.faqs = payload;
    },
    addFaqSuccess(state, { payload }) {
      state.faqs = [...state.faqs, payload];
      state.total += 1;
    },
    updateFaqSuccess(state, { payload }) {
      state.faqs = state.faqs.map((faq) =>
        faq._id === payload._id ? payload : faq,
      );
    },
    deleteFaqSuccess(state, { payload }) {
      const id = payload?._id ?? payload;
      state.faqs = state.faqs.filter((faq) => faq._id !== id);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setStatus,
  setTotal,
  setFaqs,
  addFaqSuccess,
  updateFaqSuccess,
  deleteFaqSuccess,
} = faqSlice.actions;

export default faqSlice.reducer;

// Thunks
// Add faq thunk
export function addFaq(data: object) {
  return async function addFaqThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .addFaq(data)
      .then((res) => {
        dispatch(addFaqSuccess(res?.data?.result ?? res?.data));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("FAQ added successfully");
        return true;
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
        return false;
      });
  };
}

// Get All faq thunk
export function getAllFaq(signal?: AbortSignal) {
  return async function getAllFaqThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true))
    dispatch(setStatus(STATUS.LOADING));

    return await service
      .getAllFaqs(signal)
      .then((res) => {
        dispatch(setFaqs(res?.data?.result));
        dispatch(setTotal(res?.data?.total));
        dispatch(setStatus(STATUS.IDLE));
        dispatch(setLoading(false))
      })
      .catch((error: any) => {
        // manual abort
        if (axios.isCancel(error) || error?.name === "CanceledError") return;
        dispatch(setLoading(false))
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
      });
  };
}

// Update faq thunk
export function updateFaq(
  id: string,
  data: object,
  onSuccess?: () => void,
) {
  return async function updateFaqThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .updateFaq(id, data)
      .then((res) => {
        dispatch(updateFaqSuccess(res?.data?.result ?? res?.data));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("FAQ updated successfully");
        onSuccess?.();
        return true;
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
        return false;
      });
  };
}

// Delete faq thunk
export function deleteFaq(id: string) {
  return async function deleteFaqThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .deleteFaq(id)
      .then((res) => {
        dispatch(deleteFaqSuccess(res?.data?.result ?? res?.data ?? id));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("FAQ deleted successfully");
        return true;
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error?.response);
        return false;
      });
  };
}

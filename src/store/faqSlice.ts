import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import { addFaq, deleteFaq, getAllFaqs, updateFaq } from "@/shared/_services/api_services";
import axios from "axios";

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
  error: any;
}

const initialState: InitialState = {
  faqs: [],
  total: 0,
  status: STATUS.IDLE,
  error: null,
};

export const faqSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {
    setStatus(state, { payload }) {
      state.status = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
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
      state.faqs = state.faqs.filter((faq) => faq._id !== payload._id);
    }
  },
});

export const { setStatus, setError, setTotal, setFaqs, addFaqSuccess, updateFaqSuccess, deleteFaqSuccess } =
  faqSlice.actions;

export default faqSlice.reducer;

// Thunks
// Add faq thunk
export function addFaqThunk(data: object, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await addFaq(data);
      if (res?.status === 200 || res?.status === 201) {
        dispatch(addFaqSuccess(res?.data?.result ?? res?.data));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("FAQ added successfully");
        onSuccess?.();
      }
    } catch (error: any) {
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);
    }
  };
}

// Get All faq thunk
export function getAllFaqThunk(signal?: AbortSignal) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));

    try {
      const res = await getAllFaqs(signal);
      if (res.status === 200) {
        dispatch(setFaqs(res?.data?.result));
        dispatch(setTotal(res?.data?.total));
      }
      dispatch(setStatus(STATUS.IDLE));
    } catch (error) {
      // manual abort
      if (axios.isCancel(error) || error?.name === "CanceledError") return;
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);
    }
  };
}

// Update faq thunk
export function updateFaqThunk(
  id: string,
  data: object,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await updateFaq(id, data);
      if (res?.status === 200 || res?.status === 201) {
        dispatch(setStatus(STATUS.IDLE));
        dispatch(updateFaqSuccess(res?.data));
        successHandler("FAQ updated successfully");
        onSuccess?.();
      }
    } catch (error: any) {
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);
    }
  };
}

// Delete faq thunk
export function deleteFaqThunk(id: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await deleteFaq(id);
      if (res?.status === 200 || res?.status === 201) {
        dispatch(deleteFaqSuccess(res?.data));
        dispatch(setTotal((prev: number) => prev - 1))
        dispatch(setStatus(STATUS.IDLE));
        successHandler("FAQ deleted successfully");

        return true;
      }
    } catch (error: any) {
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(error?.response?.data?.message));
      errorHandler(error?.response);

      return false;
    }
  }
}

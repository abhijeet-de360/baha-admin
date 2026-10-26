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

export type TestimonialStatus = (typeof STATUS)[keyof typeof STATUS];

export interface TestimonialItem {
  _id?: string;
  customerName: string;
  customerRole: string;
  rating: number;
  status: "active" | "inactive";
  image: string;
  review: string;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialState {
  status: TestimonialStatus;
  testimonials: TestimonialItem[];
  total: number;
  isModalOpen: boolean;
}

const initialState: TestimonialState = {
  status: STATUS.IDLE as TestimonialStatus,
  testimonials: [],
  total: 0,
  isModalOpen: false,
};

const testimonialSlice = createSlice({
  name: "testimonial",
  initialState,
  reducers: {
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setTestimonials: (state, { payload }) => {
      state.testimonials = payload.result;
      state.total = payload.total;
    },
    addTestimonialSuccess: (state, { payload }) => {
      state.testimonials = [payload, ...state.testimonials];
      state.total += 1;
    },
    updateTestimonialSuccess: (state, { payload }) => {
      state.testimonials = state.testimonials.map((t) =>
        t._id === payload._id ? payload : t,
      );
    },
    deleteTestimonialSuccess: (state, { payload }) => {
      state.testimonials = state.testimonials.filter((t) => t._id !== payload);
      state.total -= 1;
    },
    toggleModal: (state, { payload }) => {
      state.isModalOpen = payload;
    },
  },
});

export const {
  setStatus,
  setTestimonials,
  addTestimonialSuccess,
  updateTestimonialSuccess,
  deleteTestimonialSuccess,
  toggleModal,
} = testimonialSlice.actions;

export default testimonialSlice.reducer;

// Thunk functions

// Add testimonials thunk
export function addTestimonial(data: FormData) {
  return async function addTestimonialThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));

    await service
      .addTestimonial(data)
      .then((res) => {
        dispatch(addTestimonialSuccess(res.data));
        dispatch(setStatus(STATUS.IDLE));
        dispatch(toggleModal(false));
        successHandler("Testimonial added successfully");
      })
      .catch((error) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Get all testimonials thunk
export function getAllTestimonials() {
  return async function getAllTestimonialsThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .getAllTestimonials()
      .then((res) => {
        dispatch(setTestimonials(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Update testimonial thunk
export function updateTestimonial(id: string, data: FormData) {
  return async function updateTestimonialThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .updateTestimonial(id, data)
      .then((res) => {
        dispatch(updateTestimonialSuccess(res.data));
        dispatch(toggleModal(false));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Testimonial updated successfully");
      })
      .catch((error) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
};

export function deleteTestimonial(id: string) {
  return async function deleteTestimonialThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service.deleteTestimonial(id).then((res) => {
      dispatch(deleteTestimonialSuccess(id));
      dispatch(setStatus(STATUS.IDLE));
      successHandler("Testimonial deleted successfully");
    }).catch((error) => {
      dispatch(setStatus(STATUS.ERROR));
      errorHandler(error.response);
    }).finally(() => {
      dispatch(setLoading(false));
    })
  }
}

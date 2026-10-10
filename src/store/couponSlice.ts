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

export interface COUPON {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed" | "free-shipping";
  discountValue: number;
  minOrderSpend: number;
  maxCapDiscount?: number;
  totalUsageLimit?: number;
  limitPerCustomer: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "inactive" | "deleted";
  description?: string;
}

interface CouponState {
  coupons: COUPON[];
  total: number;
  status: string;
  isAddModalOpen: boolean;
}

const initialState: CouponState = {
  coupons: [],
  total: 0,
  status: STATUS.IDLE,
  isAddModalOpen: false,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    setStatus: (state, { payload }) => {
      state.status = payload;
    },
    setTotal: (state, { payload }) => {
      state.total = payload;
    },
    setCoupons: (state, { payload }) => {
      state.coupons = payload;
    },
    appendCoupons: (state, { payload }) => {
      const newItems: COUPON[] =
        payload?.result || (Array.isArray(payload) ? payload : []);
      state.coupons = [...state.coupons, ...newItems];
      if (payload?.total !== undefined) {
        state.total = payload.total;
      }
    },
    addCouponSuccess: (state, { payload }) => {
      state.coupons = [payload, ...state.coupons];
      state.total += 1;
    },
    updateCouponSuccess: (state, { payload }) => {
      state.coupons = state.coupons.map((coupon) =>
        coupon._id === payload._id ? payload : coupon,
      );
    },
    deleteCouponSuccess: (state, { payload }) => {
      state.coupons = state.coupons.filter((coupon) => coupon._id !== payload);
      state.total = Math.max(0, state.total - 1);
    },
    toogleAddModal: (state, { payload }) => {
      state.isAddModalOpen = payload;
    },
  },
});

export const {
  setCoupons,
  appendCoupons,
  setStatus,
  addCouponSuccess,
  updateCouponSuccess,
  deleteCouponSuccess,
  toogleAddModal,
  setTotal
} = couponSlice.actions;

export default couponSlice.reducer;

// Thunks
// Get all coupon thunks
export function getAllCoupons(
  keyword: string,
  limit: number,
  offset: number,
  status: string,
) {
  return async function getAllCouponsThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .getAllCoupons(keyword, limit, offset, status)
      .then((res) => {
        if (offset > 0) {
          dispatch(appendCoupons(res.data));
        } else {
          dispatch(setCoupons(res.data.result));
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

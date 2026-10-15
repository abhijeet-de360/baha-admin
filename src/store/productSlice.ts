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

export type ProductStatus = (typeof STATUS)[keyof typeof STATUS];

//******************** Product state and reducer********************
interface ProductState {
  products: any[];
  status: ProductStatus;
  error: any;
  total: number;
  isModalOpen: boolean;
}

const initialState: ProductState = {
  products: [],
  status: STATUS.IDLE,
  error: null,
  total: 0,
  isModalOpen: false,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // Set products
    setProducts(state, { payload }: { payload: any }) {
      state.products = payload;
    },

    // Set status
    setStatus(state, { payload }: { payload: ProductStatus }) {
      state.status = payload;
    },

    // Toggle modal
    toggleModal(state, { payload }: { payload: boolean }) {
      state.isModalOpen = payload;
    },
  },
});

export const { toggleModal, setStatus, setProducts } = productSlice.actions;
export default productSlice.reducer;

//******************** Product api service functions********************

export const addProductService = (data: any) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const res = await service.addProduct(data);
      dispatch(setProducts(res.data.data));
      dispatch(setStatus(STATUS.IDLE));
      dispatch(setLoading(false));
      return res;
    } catch (error: any) {
      dispatch(setLoading(false));
    }
  };
};
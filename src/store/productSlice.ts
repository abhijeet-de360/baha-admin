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
  productDetails: any;
  status: ProductStatus;
  error: any;
  total: number;
}

const initialState: ProductState = {
  products: [],
  productDetails: null,
  status: STATUS.IDLE,
  error: null,
  total: 0,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // Set products
    setProducts(state, { payload }: { payload: any }) {
      state.products = payload.result;
      state.total = payload.total;
    },

    // Set status
    setStatus(state, { payload }: { payload: ProductStatus }) {
      state.status = payload;
    },

    // Set product details
    setProductDetails(state, { payload }: { payload: any }) {
      state.productDetails = payload;
    },
  },
});

export const { setStatus, setProducts, setProductDetails } = productSlice.actions;
export default productSlice.reducer;

//******************** Product api service functions********************

export const addProduct = (data: any, navigate: any) => {
  return async function addProductThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .addProduct(data)
      .then((res: any) => {
        console.log("Add product response ===> ", res);
        navigate("/products");
        successHandler(res);
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
        dispatch(setStatus(STATUS.IDLE));
      });
  };
};

export const getAllProducts = (
  keyword: string = "",
  limit: number = 0,
  offset: number = 0,
  status: string = "",
  category: string = "",
  size: string = "",
) => {
  return async function getAllProductThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .getAllProducts(keyword, limit, offset, status, category, size)
      .then((res: any) => {
        console.log("Get all products response ===> ", res);
        dispatch(setProducts(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
        dispatch(setStatus(STATUS.IDLE));
      });
  };
};

export const getProductById = (id: string) => {
  return async function getProductByIdThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .getProductById(id)
      .then((res: any) => {
        console.log("Get product by id response ===> ", res);
        dispatch(setProductDetails(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
        dispatch(setStatus(STATUS.IDLE));
      });
  };
}



import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { setLoading } from "./loader";
import { service } from "@/shared/_services/api_services";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";

export const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
} as const);

export type BannerRequestStatus = (typeof STATUS)[keyof typeof STATUS];

export interface BannerItem {
  _id?: string;
  title: string;
  subTitle?: string;
  image: string;
  imageFileId: string;
  buttonLabel?: string;
  buttonLink?: string;
  status: "active" | "inactive" | "deleted";
  order: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface BannerState {
  banners: BannerItem[];
  bannerDetails: BannerItem | null;
  status: BannerRequestStatus;
  error: any;
  total: number;
}

const initialState: BannerState = {
  banners: [],
  bannerDetails: null,
  status: STATUS.IDLE,
  error: null,
  total: 0,
};

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    // Set banner status (loading / idle / error)
    setStatus: (state, { payload }: { payload: BannerRequestStatus }) => {
      state.status = payload;
    },

    // Set all banners and total count
    setBanners: (state, { payload }: { payload: any }) => {
      if (Array.isArray(payload)) {
        state.banners = payload;
        state.total = payload.length;
      } else if (payload && Array.isArray(payload.result)) {
        state.banners = payload.result;
        state.total = payload.total ?? payload.result.length;
      } else {
        state.banners = payload?.banners || [];
        state.total = payload?.total ?? state.banners.length;
      }
    },

    // Append banners for infinite scroll / pagination
    appendBanners: (state, { payload }: { payload: any }) => {
      const newItems =
        payload?.result || (Array.isArray(payload) ? payload : []);
      state.banners = [...state.banners, ...newItems];
      if (payload?.total !== undefined) {
        state.total = payload.total;
      }
    },

    // Set single banner details (for view / edit)
    setBannerDetails: (state, { payload }: { payload: BannerItem | null }) => {
      state.bannerDetails = payload;
    },

    // Add banner
    addBannerSuccess: (state, { payload }: { payload: BannerItem }) => {
      state.banners = [payload, ...state.banners];
      state.total += 1;
    },

    // Update banner
    updateBannerSuccess: (state, { payload }: { payload: BannerItem }) => {
      const payloadId = payload._id;
      state.banners = state.banners.map((banner) => {
        const itemId = banner._id;
        return itemId === payloadId ? { ...banner, ...payload } : banner;
      });

      const currentDetailsId = state.bannerDetails?._id;
      if (state.bannerDetails && currentDetailsId === payloadId) {
        state.bannerDetails = { ...state.bannerDetails, ...payload };
      }
    },

    deleteBannerSuccess: (state, { payload }: { payload: string }) => {
      state.banners = state.banners.filter((banner) => banner._id !== payload);
      state.total = Math.max(0, state.total - 1);
    },

    // Toggle / change banner active status
    changeBannerStatus: (
      state,
      { payload }: { payload: { id: string; status: any } },
    ) => {
      const banner = state.banners.find((item) => item._id === payload.id);
      if (banner) {
        banner.status = payload.status;
      }

      const currentDetailsId =
        state.bannerDetails?._id || state.bannerDetails?.id;
      if (state.bannerDetails && currentDetailsId === payload.id) {
        state.bannerDetails.status = payload.status;
      }
    },

    // Reset banner details
    resetBannerDetails: (state) => {
      state.bannerDetails = null;
    },

    // Set error state
    setError: (state, { payload }: { payload: any }) => {
      state.error = payload;
    },
  },
});

export const {
  setStatus,
  setBanners,
  appendBanners,
  setBannerDetails,
  addBannerSuccess,
  updateBannerSuccess,
  deleteBannerSuccess,
  changeBannerStatus,
  resetBannerDetails,
  setError,
} = bannerSlice.actions;

export default bannerSlice.reducer;

// Thunks

export function addBanner(data: FormData, navigate?: any) {
  return async function addBannerThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .addBanner(data)
      .then((res) => {
        dispatch(addBannerSuccess(res.data?.result || res.data));
        successHandler("Banner created successfully");
        navigate && navigate("/banners");
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setError(error));
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function getAllBanners(keyword: string, status: string) {
  return async function getAllBannersThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .getAllBanners(keyword, status)
      .then((res) => {
        dispatch(setBanners(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setError(error));
        dispatch(setStatus(STATUS.ERROR));
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function updateBanner(id: string, data: FormData, navigate?: any) {
  return async function updateBannerThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .updateBanner(id, data)
      .then((res) => {
        dispatch(updateBannerSuccess(res.data?.result || res.data));
        successHandler("Banner updated successfully");
        navigate && navigate("/banners");
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setError(error));
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function getBannerById(id: string) {
  return async function getBannerByIdThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .getBannerById(id)
      .then((res) => {
        dispatch(setBannerDetails(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setError(error));
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function deleteBanner(id: string) {
  return async function deleteBannerThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .deleteBanner(id)
      .then(() => {
        dispatch(deleteBannerSuccess(id));
        successHandler("Banner deleted successfully");
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((error: any) => {
        dispatch(setError(error));
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

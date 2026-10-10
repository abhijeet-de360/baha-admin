import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import { setLoading } from "./loader";
import { service } from "@/shared/_services/api_services";

export const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
} as const);

export type SettingsStatus = (typeof STATUS)[keyof typeof STATUS];

export interface PaymentInfo {
  prepaidDeliveryFee: number;
  freePrepaidDeliveryOn: number;
  codDeliveryFee: number;
  freeCodDeliveryOn: number;
  maxFreeCodDeliveryOn: number;
}

export interface ContactInfo {
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube?: string;
  linkedin?: string;
}

export interface SettingsData {
  _id?: string;
  paymentInfo?: PaymentInfo;
  contactInfo?: ContactInfo;
  privacyPolicy?: string;
  termsConditions?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  socialLinks?: SocialLinks;
  __v?: number;
}

export interface SettingsState {
  _id: string;
  settings: SettingsData | null;
  status: SettingsStatus;
}

const initialState: SettingsState = {
  _id: "",
  settings: null,
  status: STATUS.IDLE,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
      if (action.payload?._id) {
        state._id = action.payload._id;
      }
    },
  },
});

export const { setStatus, setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;

// Settings thunks
export function getAllSettings() {
  return async function getAllSettingsThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .getAllSettings()
      .then((res: any) => {
        dispatch(setSettings(res.data));
        dispatch(setStatus(STATUS.IDLE));
        dispatch(setLoading(false));
        return res.data;
      })
      .catch((err: any) => {
        dispatch(setStatus(STATUS.ERROR));
        dispatch(setLoading(false));
        errorHandler(err?.response || err);
        return null;
      });
  };
}

export function updateSettings(data: Partial<SettingsData>) {
  return async function updateSettingsThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .updateSettings(data)
      .then((res: any) => {
        dispatch(setSettings(res.data));
        dispatch(setStatus(STATUS.IDLE));
        dispatch(setLoading(false));
        successHandler("Settings updated successfully!");
      })
      .catch((err: any) => {
        dispatch(setStatus(STATUS.ERROR));
        dispatch(setLoading(false));
        errorHandler(err?.response || err);
      });
  };
}

import { service } from "@/shared/_services/api_services";
import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { localService } from "@/shared/_session/local";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";
import { setLoading } from "./loader";

export const STATUS = Object.freeze({
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
} as const);

export type AuthStatus = (typeof STATUS)[keyof typeof STATUS];

export interface AdminUser {
  _id?: string;
  name?: string;
  email?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localService.get("token"),
  status: STATUS.IDLE,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      // set token in local storage
      localService.set("token", payload.token);
      state.isAuthenticated = true;
    },
    setProfileData: (state, { payload }) => {
      state.user = payload;
    },
    setStatus(state, { payload }: { payload: AuthStatus }) {
      state.status = payload;
    },
    setLogout(state) {
      localService.clearAll();
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setProfileData, setStatus, setLogout } =
  authSlice.actions;

export default authSlice.reducer;

export function login(email: string, password: string, navigate) {
  return async function loginThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .loginUser({ email, password })
      .then((res) => {
        // console.log("login res : ", res);
        dispatch(setUser(res.data));
        successHandler("Login successfully.");
        dispatch(setStatus(STATUS.IDLE));
        navigate("/");
      })
      .catch((err) => {
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

export function getProfile() {
  return async function getProfileThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    await service
      .getProfile()
      .then((res) => {
        // console.log("me res : ", res);
        dispatch(setProfileData(res.data));
        dispatch(setStatus(STATUS.IDLE));
      })
      .catch((err) => {
        // console.log("me err : ", err);
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err.response);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
}

// Logout thunk
export function logoutUser(navigate) {
  return async function logoutUserThunk(dispatch: AppDispatch) {
    dispatch(setLogout());
    navigate("/");
    successHandler("Logout successfully.");
  };
}

// Update profile thunk
export function updateAdminProfile(data: { name: string; email: string }) {
  return async function updateProfileThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .updateProfile(data)
      .then((res) => {
        dispatch(setProfileData(res.data));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Profile updated successfully.");
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

// Reset password thunk
export function resetPassword(data: {
  oldPassword: string;
  newPassword: string;
}) {
  return async function resetPasswordThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .resetPassword(data)
      .then((res) => {
        dispatch(setStatus(STATUS.IDLE));
        successHandler(res.data?.message || "Password updated successfully.");
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

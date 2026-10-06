import {
  loginUser,
  me,
  updateProfile,
  resetPassword,
} from "@/shared/_services/api_services";
import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";
import { localService } from "@/shared/_session/local";
import { errorHandler, successHandler } from "@/shared/_helper/responseHelper";

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
  error: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localService.get("token"),
  status: STATUS.IDLE,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // set token in local storage
      localService.set("token", action.payload.token);
      state.isAuthenticated = true;
    },
    setProfileData: (state, action) => {
      state.user = action.payload;
    },
    setStatus(state, { payload }: { payload: AuthStatus }) {
      state.status = payload;
    },
    setLogout(state) {
      localService.clearAll();
      state.isAuthenticated = false;
    },
    setError(state, { payload }) {
      state.status = STATUS.ERROR;
      state.error = payload;
    },
  },
});

export const { setUser, setProfileData, setStatus, setLogout, setError } =
  authSlice.actions;

export default authSlice.reducer;

export function login(email: string, password: string, navigate) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      await loginUser({ email, password })
        .then((res) => {
          // console.log("login res : ", res);
          if (res.status === 200) {
            dispatch(setUser(res.data));
            successHandler("Login successfully.");
            dispatch(setStatus(STATUS.IDLE));
            navigate("/");
          }
        })
        .catch((err) => {
          console.log("login err : ", err);
          dispatch(setStatus(STATUS.ERROR));
          errorHandler(err.response);
        });
    } catch (error) {
      dispatch(setStatus(STATUS.ERROR));
      errorHandler(error);
    }
  };
}

export function getMe() {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      await me()
        .then((res) => {
          console.log("me res : ", res);
          if (res.status === 200) {
            dispatch(setProfileData(res.data));
            dispatch(setStatus(STATUS.IDLE));
          }
        })
        .catch((err) => {
          console.log("me err : ", err);
          dispatch(setStatus(STATUS.ERROR));
          errorHandler(err.response);
        });
    } catch (error) {
      dispatch(setStatus(STATUS.ERROR));
      throw error;
    }
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
export function updateAdminProfile(
  data: { name: string; email: string },
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await updateProfile(data);
      if (res.status === 200) {
        dispatch(setProfileData(res.data));
        dispatch(setStatus(STATUS.IDLE));
        successHandler("Profile updated successfully.");
        if (onSuccess) onSuccess();
        return true;
      }
    } catch (err: any) {
      console.log("update profile err : ", err);
      dispatch(setStatus(STATUS.ERROR));
      errorHandler(err?.response || err);
      return false;
    }
  };
}

// Reset password thunk
export function resetPasswordThunk(
  data: { oldPassword: string; newPassword: string },
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const res = await resetPassword(data);
      if (res.status === 200) {
        dispatch(setStatus(STATUS.IDLE));
        successHandler(res.data?.message || "Password updated successfully.");
        if (onSuccess) onSuccess();
        return true;
      }
      dispatch(setStatus(STATUS.IDLE));
      return false;
    } catch (err: any) {
      console.log("reset password err : ", err);
      // dispatch(setStatus(STATUS.ERROR));
      dispatch(setError(err?.response.message || err));
      errorHandler(err?.response || err);
      return false;
    }
  };
}

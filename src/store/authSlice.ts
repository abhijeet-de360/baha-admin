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
  },
});

export const { setUser, setProfileData, setStatus, setLogout } =
  authSlice.actions;

export default authSlice.reducer;

export function login(email: string, password: string, navigate) {
  return async function loginThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    try {
      await service
        .loginUser({ email, password })
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

export function getProfile() {
  return async function getProfileThunk(dispatch: AppDispatch) {
    dispatch(setLoading(true));
    dispatch(setStatus(STATUS.LOADING));
    try {
      await service
        .getProfile()
        .then((res) => {
          // console.log("me res : ", res);
          dispatch(setProfileData(res.data));
          dispatch(setStatus(STATUS.IDLE));
          dispatch(setLoading(false));
        })
        .catch((err) => {
          // console.log("me err : ", err);
          dispatch(setStatus(STATUS.ERROR));
          errorHandler(err.response);
          dispatch(setLoading(false));
        });
    } catch (error) {
      dispatch(setStatus(STATUS.ERROR));
      dispatch(setLoading(false));
      errorHandler(error.response || error);
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
  return async function updateProfileThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .updateProfile(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch(setProfileData(res.data));
          dispatch(setStatus(STATUS.IDLE));
          successHandler("Profile updated successfully.");
          if (onSuccess) onSuccess();
          return true;
        }
        return false;
      })
      .catch((err: any) => {
        console.log("update profile err : ", err);
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err?.response || err);
        return false;
      });
  };
}

// Reset password thunk
export function resetPassword(data: {
  oldPassword: string;
  newPassword: string;
}) {
  return async function resetPasswordThunk(dispatch: AppDispatch) {
    dispatch(setStatus(STATUS.LOADING));
    return await service
      .resetPassword(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch(setStatus(STATUS.IDLE));
          successHandler(res.data?.message || "Password updated successfully.");
          return true;
        }
        dispatch(setStatus(STATUS.IDLE));
        return false;
      })
      .catch((err: any) => {
        // console.log("reset password err : ", err.response);
        dispatch(setStatus(STATUS.ERROR));
        errorHandler(err?.response || err);
        return false;
      });
  };
}

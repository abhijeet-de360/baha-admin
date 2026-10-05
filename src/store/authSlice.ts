import { loginUser, me } from "@/_services/api_services";
import { createSlice } from "@reduxjs/toolkit";
import type { AppDispatch } from "./store";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setUser, setError, logout } = authSlice.actions;

export default authSlice.reducer;

export function login(email: string, password: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await loginUser({ email, password })
        .then((res) => {
          console.log("login res : ", res);
          if (res.status === 200) {
            dispatch(setUser(res.data.admin));
            dispatch(setError(null));
          }
        })
        .catch((err) => {
          console.log("login err : ", err);
          dispatch(setError(err));
        });
    } catch (error) {
      dispatch(setError(error));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function getMe() {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await me()
        .then((res) => {
          console.log("me res : ", res);
          if (res.status === 200) {
            dispatch(setUser(res.data));
            dispatch(setError(null));
          }
        })
        .catch((err) => {
          console.log("me err : ", err);
          dispatch(setError(err));
        });
    } catch (error) {
      dispatch(setError(error));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

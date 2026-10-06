import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import colorReducer from "./colorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    color: colorReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

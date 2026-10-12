import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import colorReducer from "./colorSlice";
import faqReducer from "./faqSlice";
import sizeReducer from "./sizeSlice";
import settingsReducer from "./settingsSlice";
import couponReducer from "./couponSlice";
import categoryReducer from "./categorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    color: colorReducer,
    faq: faqReducer,
    size: sizeReducer,
    settings: settingsReducer,
    coupon: couponReducer,
    category: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

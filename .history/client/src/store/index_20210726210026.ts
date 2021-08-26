import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./info";

export const store = configureStore({
  reducer: {
    info: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

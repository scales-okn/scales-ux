import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./info";
import ringsReducer from "./rings";

export const store = configureStore({
  reducer: {
    info: infoReducer,
    rings: ringsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

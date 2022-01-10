import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, applyMiddleware } from "redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import { reducer as notificationsReducer } from "reapop";

// Reducers
import auth from "./auth";
import info from "./info";
import rings from "./rings";
import notebooks from "./notebooks";
import notebook from "./notebook";
import panels from "./panels";

// Middlewares
import { authMiddleware } from "./auth";

const reducers = combineReducers({
  auth,
  info,
  rings,
  notebooks,
  notebook,
  panels,
  notifications: notificationsReducer(),
});

const persistConfig = {
  key: "satyrn",
  version: Number(process.env.REACT_APP_VERSION.replace(/\./g, "")) || 1,
  storage,
  blacklist: ["notifications"],
};

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk],
});

export const persistor = persistStore(store);

export default store;

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
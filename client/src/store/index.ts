import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, applyMiddleware } from "redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import { reducer as notificationsReducer } from "reapop";

// Reducers
import auth from "store/auth";
import rings from "store/rings";
import notebooks from "store/notebooks";
import notebook from "store/notebook";
import panels from "store/panels";
import users from "store/users";

// Middlewares
import { authMiddleware } from "store/auth";

// Root reducer
const reducers = combineReducers({
  auth,
  rings,
  notebooks,
  notebook,
  panels,
  notifications: notificationsReducer(),
  users
});

const persistConfig = {
  key: "satyrn",
  version: Number(process.env.REACT_APP_VERSION.replace(/\./g, "")) || 1,
  storage,
  blacklist: ["notifications"],
};

// Store
const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk, authMiddleware],
});

// Persisted store
export const persistor = persistStore(store);

export default store;

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

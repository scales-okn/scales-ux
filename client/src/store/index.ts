import { configureStore } from "@reduxjs/toolkit";
// import { combineReducers, applyMiddleware } from "redux";
import { combineReducers } from "redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import { reducer as notificationsReducer } from "reapop";

// Reducers
import auth, { authMiddleware } from "./auth";
import rings from "./rings";
import notebooks from "./notebooks";
import notebook from "./notebook";
import panels from "./panels";
import helpTexts from "./helpTexts";

// Root reducer
const reducers = combineReducers({
  auth,
  rings,
  notebooks,
  notebook,
  panels,
  helpTexts,
  notifications: notificationsReducer(),
});

const persistConfig = {
  key: "satyrn",
  version:
    Number(import.meta.env.VITE_REACT_APP_VERSION.replace(/\./g, "")) || 1,
  storage,
  blacklist: ["notifications"],
};

// Store
const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  devTools: import.meta.env.MODE !== "production",
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

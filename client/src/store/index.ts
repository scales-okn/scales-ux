import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import { reducer as notificationsReducer } from "reapop";

// Reducers
import auth, { authMiddleware } from "./auth";
import rings from "./rings";
import notebook from "./notebook";
import panels from "./panels";
import helpTexts from "./helpTexts";
import user from "./user";
import connections from "./connection";
import teams from "./team";
import alerts from "./alerts";

// Create a separate reducer for the auth slice
const authPersistConfig = {
  key: "auth",
  storage,
  blacklist: [], // You can blacklist any keys within the auth slice that you don't want to persist
};

// Use persistReducer for the auth slice
const persistedAuthReducer = persistReducer(authPersistConfig, auth);

// Store
const store = configureStore({
  reducer: combineReducers({
    auth: persistedAuthReducer,
    rings,
    notebook,
    user,
    panels,
    helpTexts,
    connections,
    teams,
    alerts,
    notifications: notificationsReducer(),
  }),
  // @ts-ignore
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

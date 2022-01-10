import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";
import jwt_decode from "jwt-decode";
import { useSelector, useDispatch } from "react-redux";
import { Store, Dispatch, Action } from "redux";
import { notify } from "reapop";
import { useUnknownErrorNotificationMessage } from "../components/Notifications";

export interface User {
  id: number;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  blocked: boolean;
  approved: boolean;
}

export interface DecodedToken {
  user: User | null;
  iat: number;
  exp: number;
}

interface InitialState extends DecodedToken {
  hasErrors: boolean;
  errors: any;
  loading: boolean;
  token: string;
}

export const initialState: InitialState = {
  loading: false,
  hasErrors: false,
  errors: null,
  token: null,
  user: null,
  iat: null,
  exp: null,
};

// Slices
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (state) => ({
      ...state,
      loading: true,
    }),
    signInSuccess: (state, { payload }) => ({
      ...state,
      ...payload,
      loading: false,
      hasErrors: false,
      errors: null,
    }),
    signInFailure: (state, { payload }) => ({
      ...state,
      loading: false,
      hasErrors: true,
      errors: payload,
    }),
    signOut: () => initialState,
  },
});

// Actions
export const { signIn, signInSuccess, signInFailure, signOut } =
  authSlice.actions;

// Selectors
export const authSelector = (state: RootState) => state.auth;
export const userSelector = (state: RootState) => state.auth?.user;

// The reducer
export default authSlice.reducer;

// Asynchronous thunk actions
export const login = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(signIn());
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/users/login`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { data, code, message, errors } = await response.json();
      let decodedToken: DecodedToken = null;

      switch (code) {
        case 200:
          decodedToken = jwt_decode(data.token);
          if (decodedToken) {
            dispatch(signInSuccess({ ...decodedToken, token: data.token }));
          }
          break;
        default:
          dispatch(signInFailure(errors));
          dispatch(
            notify(message || useUnknownErrorNotificationMessage, "error")
          );
          break;
      }
    } catch (error) {
      console.log(error);
      dispatch(notify(useUnknownErrorNotificationMessage, "error"));
      dispatch(signInFailure(error));
    }
  };
};

export const logout = () => {
  return (dispatch: AppDispatch) => {
    dispatch(signOut());
  };
};

export const authorizationHeader = (token: string) => {
  return {
    Authorization: `Bearer ${token}`,
  }
};

// Hooks
export const useAuthHeader = () => {
  const { token } = useSelector(authSelector);
  
  return authorizationHeader(token);
};

export const useAuth = () => {
  const { token } = useSelector(authSelector);
  const dispatch = useDispatch();

  return {
    token,
    login: (email: string, password: string) => {
      dispatch(login(email, password));
    },
    logout: () => {
      dispatch(logout());
    },
  };
};

// Middlewares
export const authMiddleware =
  (store: Store) => (next: Dispatch) => (action: Action) => {
    next(action);
    if (action.type !== "auth/signOut") {
      const { exp, iat } = store.getState().auth;
      if (exp && iat) {
        const now = new Date().getTime() / 1000;
        if (now > exp) {
          store.dispatch(
            notify(
              "You've been logged off. Your session has expired.",
              "warning"
            )
          );
          store.dispatch(signOut());
        }
      }
    }
  };

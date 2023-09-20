/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import jwt_decode from "jwt-decode";
import { useSelector, useDispatch } from "react-redux";
import { Store, Dispatch, Action } from "redux";
import { notify } from "reapop";
import { useUnknownErrorNotificationMessage } from "src/components/Notifications";
import { authorizationHeader } from "src/helpers/authorizationHeader";
import { makeRequest } from "src/helpers/makeRequest";

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

// Slice
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
export const authActions = authSlice.actions;

// Selectors
export const authSelector = (state: RootState) => state.auth;
export const userSelector = (state: RootState) => state.auth?.user;
export const tokenSelector = (state: RootState) => state.auth?.token;

// The reducer
export default authSlice.reducer;

// Asynchronous thunk actions
export const login = (email: string, password: string, rememberMe = false) => {
  return async (dispatch: AppDispatch) => {
    dispatch(authActions.signIn());
    try {
      const response = await makeRequest.post(`/api/users/login`, {
        email,
        password,
        rememberMe,
      });

      const { data, code, message, errors } = response;
      let decodedToken: DecodedToken = null;

      switch (code) {
        case 200:
          decodedToken = jwt_decode(data.token);
          if (decodedToken) {
            dispatch(
              authActions.signInSuccess({ ...decodedToken, token: data.token }),
            );
          }
          break;
        default:
          dispatch(authActions.signInFailure(errors));
          dispatch(
            notify(message || useUnknownErrorNotificationMessage, "error"),
          );
          break;
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(notify(useUnknownErrorNotificationMessage, "error"));
      dispatch(authActions.signInFailure(error));
    }
  };
};

// Synchronous actions
export const logout = () => {
  return (dispatch: AppDispatch) => {
    dispatch(authActions.signOut());
  };
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
          store.dispatch(authActions.signOut());
        }
      }
    }
  };

export const useUser = () => {
  const { user } = useSelector(authSelector);
  return user;
};

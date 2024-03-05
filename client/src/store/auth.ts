/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSelector, useDispatch } from "react-redux";
import { Store, Dispatch, Action } from "redux";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";

import jwt_decode from "jwt-decode";
import { notify } from "reapop";

import { authorizationHeader } from "src/helpers/authorizationHeader";
import { makeRequest } from "src/helpers/makeRequest";

import { useUnknownErrorNotificationMessage } from "src/components/Notifications";

interface InitialState extends DecodedToken {
  hasErrors: boolean;
  errors: any;
  loading: boolean;
  token: string;
  savedUrl: string;
}

export const initialState: InitialState = {
  loading: false,
  hasErrors: false,
  errors: null,
  token: null,
  user: null,
  iat: null,
  exp: null,
  savedUrl: null,
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
    updateSessionUserSuccess: (state, { payload }) => ({
      ...state,
      user: { ...state.user, ...payload },
    }),
    updateSessionUserFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    signOut: () => initialState,
  },
});

// Actions
export const authActions = authSlice.actions;

// Selectors
export const authSelector = (state: RootState) => state.auth;
export const sessionUserSelector = (state: RootState) => state.auth?.user;
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

export const updateSessionUser = (userId, payload: any = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.put(
        `/api/users/${userId}`,
        payload,
      );
      if (code === 200) {
        dispatch(authActions.updateSessionUserSuccess(data.user));
        dispatch(notify(message, "success"));
      } else {
        dispatch(notify(message, "error"));
        dispatch(authActions.updateSessionUserFailure());
      }
    } catch (error) {
      dispatch(authActions.updateSessionUserFailure());
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
  const { savedUrl } = useSelector(authSelector);
  const dispatch = useDispatch();

  return {
    token,
    savedUrl,
    login: (email: string, password: string) => {
      dispatch(login(email, password));
    },
    updateSessionUser: (userId, payload: any = {}) => {
      dispatch(updateSessionUser(userId, payload));
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

export const useSessionUser = () => {
  const { user } = useSelector(authSelector);
  return user;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { useSelector, useDispatch } from "react-redux";
// import { Store, Dispatch, Action } from "redux";
import { sessionUserSelector } from "src/store/auth";
import { notify } from "reapop";

import { makeRequest } from "src/helpers/makeRequest";

type UserT = {
  approved: boolean;
  blocked: boolean;
  createdAt: string;
  email: string;
  emailIsVerified: boolean;
  emailVerificationToken: string;
  firstName: string;
  id: number;
  lastName: string;
  passwordResetToken: string;
  role: string;
  updatedAt: string;
  usage: string;
};

type InitialStateT = {
  users: UserT[];
  loadingUsers: boolean;
  hasErrors: boolean;
};

export const initialState: InitialStateT = {
  users: [],
  loadingUsers: false,
  hasErrors: false,
};

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUsers: (state) => ({
      ...state,
      loadingUsers: true,
    }),
    fetchUsersSuccess: (state, { payload }) => {
      return {
        ...state,
        loadingUsers: false,
        hasErrors: false,
        users: payload,
      };
    },
    fetchUsersFailure: (state) => ({
      ...state,
      loadingUsers: false,
      hasErrors: true,
    }),
    updateUserSuccess: (state, { payload }) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === payload.id
          ? { ...user, ...payload, updatingUser: false }
          : user,
      ),
      hasErrors: false,
    }),
    updateUserFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
  },
});

// Actions
export const userActions = userSlice.actions;

// Selectors
export const usersSelector = (state: RootState) => state.user?.users;

// The reducer
export default userSlice.reducer;

// Asynchronous thunk actions
export const fetchUsers = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(userActions.fetchUsers());

      const { data, message, code } = await makeRequest.get(`/api/users`);

      if (code === 200) {
        dispatch(userActions.fetchUsersSuccess(data.users));
      } else {
        dispatch(notify(message, "error"));
        dispatch(userActions.fetchUsersFailure());
      }
    } catch (error) {
      dispatch(userActions.fetchUsersFailure());
    }
  };
};

export const updateUser = (userId, payload: any = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.put(
        `/api/users/${userId}`,
        payload,
      );
      if (code === 200) {
        dispatch(userActions.updateUserSuccess(data.user));
      } else {
        dispatch(notify(message, "error"));
        dispatch(userActions.updateUserFailure());
      }
    } catch (error) {
      dispatch(userActions.updateUserFailure());
    }
  };
};

// Hooks
export const useUser = () => {
  const users = useSelector(usersSelector);
  const dispatch = useDispatch();

  return {
    users,
    fetchUsers: () => dispatch(fetchUsers()),
    updateUser: (userId, payload: any = {}) =>
      dispatch(updateUser(userId, payload)),
  };
};

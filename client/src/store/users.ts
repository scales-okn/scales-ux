import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "store";
import { useSelector, useDispatch } from "react-redux";
import { notify } from "reapop";
import { unknownErrorNotificationMessage } from "components/Notifications";
import { authorizationHeader } from "utils";
import { authSelector } from "store/auth";

export interface UserList {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

interface InitialState {
  loadingUsersList: boolean;
  hasErrorsUsersList: boolean;
  errorsUsersList: any;
  usersList: Array<UserList>;
}

const initialState: InitialState = {
  loadingUsersList: false,
  hasErrorsUsersList: false,
  errorsUsersList: null,
  usersList: [],
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    getUsersList: (state) => ({
      ...state,
      loadingUsersList: true,
    }),
    getUsersListSuccess: (state, { payload }) => ({
      ...state,
      usersList: payload,
      loadingUsersList: false,
      hasErrorsUsersList: false,
      errorsUsersList: null,
    }),
    getUsersListFailure: (state, { payload }) => ({
      ...state,
      loadingUsersList: false,
      hasErrorsUsersList: true,
      errorsUsersList: payload,
    }),
    clearUsersList: (state) => ({
      ...state,
      usersList: [],
      loadingUsersList: false,
    }),
  },
});

// Actions
export const usersActions = usersSlice.actions;

// Selectors
export const usersSelector = (state: RootState) => state.users;
export const usersListSelector = (state: RootState) => state.users?.usersList;

// The reducer
export default usersSlice.reducer;

// Asynchronous actions
export const fetchUsersList = () => {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(usersActions.getUsersList());
    try {
      const response = await fetch("/api/users/list", {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        }
      });
      const { data } = await response.json();
      dispatch(usersActions.getUsersListSuccess(data.usersList));
    } catch (error) {
      dispatch(usersActions.getUsersListFailure(error));
      dispatch(notify(error.message || unknownErrorNotificationMessage, "error"));
    }
  };
}

// Synchronous actions
export const clearUsersList = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(usersActions.clearUsersList());
  };
}

// Hooks
export const useUsers = () => {
  const dispatch = useDispatch();
  const { loadingUsersList, hasErrorsUsersList} = useSelector(usersSelector);
  const usersList = useSelector(usersListSelector);

  return {
    loadingUsersList,
    hasErrorsUsersList,
    usersList,
    fetchUsersList: () => dispatch(fetchUsersList()),
    clearUsersList: () => dispatch(clearUsersList()),
  };
}


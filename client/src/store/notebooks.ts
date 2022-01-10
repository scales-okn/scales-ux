import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";
import { authSelector, authorizationHeader } from "./auth";
import { useSelector, useDispatch } from "react-redux";

interface InitialState {
  loadingNotebooks: boolean;
  hasErrors: boolean;
  notebooks: any;
}

export const initialState: InitialState = {
  loadingNotebooks: true,
  hasErrors: false,
  notebooks: [],
};

// A slice for notebooks with our three reducers
const notebooksSlice = createSlice({
  name: "notebooks",
  initialState,
  reducers: {
    getNotebooks: (state) => ({
      ...state,
      loadingNotebooks: true
    }),
    getNotebooksSuccess: (state, { payload }) => ({
      ...state,
      notebooks: payload,
      loadingNotebooks: false,
      hasErrors: false,
    }),
    getNotebooksFailure: (state) => ({
      ...state,
      loadingNotebooks: false,
      hasErrors: true,
    }),
  },
});

// Three actions generated from the slice
export const { getNotebooks, getNotebooksSuccess, getNotebooksFailure } =
  notebooksSlice.actions;

// Selectors
export const notebooksSelector = (state: RootState) => state.notebooks;

// The reducer
export default notebooksSlice.reducer;

export function fetchNotebooks() {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);

    dispatch(getNotebooks());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks`,
        {
          method: "GET",
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      const { data } = await response.json();

      dispatch(getNotebooksSuccess(data.notebooks));
    } catch (error) {
      console.log(error);
      dispatch(getNotebooksFailure());
    }
  };
}

export const useFetchNotebooks = () => {
  const dispatch = useDispatch();
  return {
    fetchNotebooks: () => dispatch(fetchNotebooks()),
  }
}

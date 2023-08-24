import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "store";
import { authSelector } from "store/auth";
import { useDispatch, useSelector } from "react-redux";
// import { notify } from "reapop";
import { authorizationHeader } from "utils";

type InitialStateT = {
  loadingHelpTexts: boolean;
  hasErrors: boolean;
  helpTexts: Record<string, unknown>[];
};

const initialState: InitialStateT = {
  loadingHelpTexts: false,
  hasErrors: false,
  helpTexts: null,
};

// A slice for helpTexts
const helpTextsSlice = createSlice({
  name: "helpTexts",
  initialState,
  reducers: {
    getHelpTexts: (state) => ({
      ...state,
      loadingHelpTexts: true,
    }),
    getHelpTextsSuccess: (state, { payload }) => {
      return {
        ...state,
        helpTexts: payload,
        loadingHelpTexts: false,
        hasErrors: false,
      };
    },
    getHelpTextsFailure: (state) => ({
      ...state,
      loadingHelpTexts: false,
      hasErrors: true,
    }),
  },
});

// Actions generated from the slice
export const helpTextsActions = helpTextsSlice.actions;

// Selectors
export const helpTextsSelector = (state: RootState) => {
  return state?.helpTexts;
};

// The reducer
export default helpTextsSlice.reducer;

// Async actions
export const getHelpTexts = () => {
  return async (dispatch: AppDispatch, getState) => {
    try {
      const { token } = authSelector(getState());
      const authHeader = authorizationHeader(token);
      dispatch(helpTextsActions.getHelpTexts());

      const response = await fetch(`/api/helpTexts`, {
        headers: {
          ...authHeader,
        },
      });
      const { data } = await response.json();

      if (response.status === 200) {
        dispatch(helpTextsActions.getHelpTextsSuccess(data.helpTexts));
      } else {
        dispatch(helpTextsActions.getHelpTextsFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(helpTextsActions.getHelpTextsFailure());
    }
  };
};

// Hooks
export const useHelpTexts = () => {
  const { helpTexts, hasErrors, loadingHelpTexts } =
    useSelector(helpTextsSelector);
  const dispatch = useDispatch();

  return {
    helpTextsActions,
    helpTexts,
    loadingHelpTexts,
    hasErrors,
    getHelpTexts: () => dispatch(getHelpTexts()),
  };
};

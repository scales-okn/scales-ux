import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./";
import { useDispatch, useSelector } from "react-redux";
import { makeRequest } from "src/helpers/makeRequest";

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
    deleteHelpText: (state) => ({
      ...state,
      loadingHelpTexts: true,
    }),
    deleteHelpTextSuccess: (state, action) => {
      const { slug } = action.payload;

      return {
        ...state,
        helpTexts: state.helpTexts.filter((helpText) => helpText.slug !== slug),
        hasErrors: false,
      };
    },
    deleteHelpTextFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    createHelpText: (state) => ({
      ...state,
      loadingHelpTexts: true,
    }),
    createHelpTextSuccess: (state, action) => {
      const { newHelpText } = action.payload;

      return {
        ...state,
        helpTexts: [newHelpText, ...state.helpTexts],
        hasErrors: false,
      };
    },
    createHelpTextFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    updateHelpText: (state) => ({
      ...state,
      loadingHelpTexts: true,
    }),
    updateHelpTextSuccess: (state, action) => {
      const { updatedHelpText } = action.payload;

      return {
        ...state,
        helpTexts: state.helpTexts.map((helpText) => {
          if (helpText.slug === updatedHelpText.slug) {
            return updatedHelpText;
          }
          return helpText;
        }),
        loadingHelpTexts: false,
        hasErrors: false,
      };
    },
    updateHelpTextFailure: (state) => ({
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
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(helpTextsActions.getHelpTexts());

      const response = await makeRequest.get(`/api/helpTexts`);

      if (response.code === 200) {
        dispatch(helpTextsActions.getHelpTextsSuccess(response.data.helpTexts));
      } else {
        dispatch(helpTextsActions.getHelpTextsFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(helpTextsActions.getHelpTextsFailure());
    }
  };
};

export const deleteHelpText = (slug: string) => {
  return async (dispatch: AppDispatch, getState) => {
    try {
      dispatch(helpTextsActions.deleteHelpText());

      const response = await makeRequest.delete(`/api/helpTexts/${slug}`);

      if (response.code === 200) {
        dispatch(helpTextsActions.deleteHelpTextSuccess({ slug }));
      } else {
        dispatch(helpTextsActions.deleteHelpTextFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(helpTextsActions.deleteHelpTextFailure());
    }
  };
};

export const createHelpText = (values: Record<string, unknown>) => {
  return async (dispatch: AppDispatch, getState) => {
    try {
      dispatch(helpTextsActions.createHelpText());

      const response = await makeRequest.post(`/api/helpTexts`, values);

      if (response.code === 200) {
        dispatch(
          helpTextsActions.createHelpTextSuccess({
            newHelpText: response.data.helpText,
          }),
        );
      } else {
        dispatch(helpTextsActions.createHelpTextFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(helpTextsActions.createHelpTextFailure());
    }
  };
};

export const updateHelpText = (
  slug: string,
  values: Record<string, unknown>,
) => {
  return async (dispatch: AppDispatch, getState) => {
    try {
      dispatch(helpTextsActions.updateHelpText());

      const response = await makeRequest.patch(
        `/api/helpTexts/${slug}`,
        values,
      );

      if (response.code === 200) {
        dispatch(
          helpTextsActions.updateHelpTextSuccess({
            updatedHelpText: response.data.helpText,
          }),
        );
      } else {
        dispatch(helpTextsActions.updateHelpTextFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(helpTextsActions.updateHelpTextFailure());
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
    deleteHelpText: (slug) => dispatch(deleteHelpText(slug)),
    createHelpText: (values) => dispatch(createHelpText(values)),
    updateHelpText: (slug, values) => dispatch(updateHelpText(slug, values)),
  };
};

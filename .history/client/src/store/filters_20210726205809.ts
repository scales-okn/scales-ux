import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  loading: false,
  hasErrors: false,
  info: [],
};

// A slice for info with our three reducers
const infoSlice = createSlice({
  name: "info",
  initialState,
  reducers: {
    getFilters: (state) => {
      state.loading = true;
    },
    getFiltersSuccess: (state, { payload }) => {
      state.info = payload;
      state.loading = false;
      state.hasErrors = false;
    },
    getFiltersFailure: (state) => {
      state.loading = false;
      state.hasErrors = true;
    },
  },
});

// Three actions generated from the slice
export const { getFilters, getFiltersSuccess, getFiltersFailure } =
  infoSlice.actions;

// Selectors
export const filtersSelector = (state) => state.filters;
export const analysisSpaceSelector = (state) => state.analysisSpace;

// The reducer
export default infoSlice.reducer;

// Asynchronous thunk action
export function fetchInfo() {
  return async (dispatch) => {
    dispatch(getFilters());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/info`
      );
      const data = await response.json();

      dispatch(getFiltersSuccess(data));
    } catch (error) {
      dispatch(getFiltersFailure());
    }
  };
}

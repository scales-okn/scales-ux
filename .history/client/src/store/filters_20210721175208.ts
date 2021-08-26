import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  loading: false,
  hasErrors: false,
  filters: [],
};

// A slice for filters with our three reducers
const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    getFilters: (state) => {
      state.loading = true;
    },
    getFiltersSuccess: (state, { payload }) => {
      state.filters = payload;
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
  filtersSlice.actions;

// A selector
export const filtersSelector = (state) => state.filters;

// The reducer
export default filtersSlice.reducer;

// Asynchronous thunk action
export function fetchFilters() {
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

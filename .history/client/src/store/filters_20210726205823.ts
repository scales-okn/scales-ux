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
    getInfo: (state) => {
      state.loading = true;
    },
    getInfoSuccess: (state, { payload }) => {
      state.info = payload;
      state.loading = false;
      state.hasErrors = false;
    },
    getInfoFailure: (state) => {
      state.loading = false;
      state.hasErrors = true;
    },
  },
});

// Three actions generated from the slice
export const { getInfo, getInfoSuccess, getInfoFailure } = infoSlice.actions;

// Selectors
export const filtersSelector = (state) => state.filters;
export const analysisSpaceSelector = (state) => state.analysisSpace;

// The reducer
export default infoSlice.reducer;

// Asynchronous thunk action
export function fetchInfo() {
  return async (dispatch) => {
    dispatch(getInfo());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/info`
      );
      const data = await response.json();

      dispatch(getInfoSuccess(data));
    } catch (error) {
      dispatch(getInfoFailure());
    }
  };
}

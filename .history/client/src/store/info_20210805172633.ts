import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";

interface Info {
  filters: Array<any>;
  columns: Array<any>;
}

interface InitialState {
  loadingInfo: boolean;
  hasErrors: boolean;
  info: Info;
}

export const initialState = {
  loadingInfo: false,
  hasErrors: false,
  info: {},
};

// A slice for info with our three reducers
const infoSlice = createSlice({
  name: "info",
  initialState,
  reducers: {
    getInfo: (state) => {
      state.loadingInfo = true;
    },
    getInfoSuccess: (state, { payload }) => {
      state.info = payload;
      state.loadingInfo = false;
      state.hasErrors = false;
    },
    getInfoFailure: (state) => {
      state.loadingInfo = false;
      state.hasErrors = true;
    },
  },
});

// Three actions generated from the slice
export const { getInfo, getInfoSuccess, getInfoFailure } = infoSlice.actions;

// Selectors
export const infoSelector = (state: RootState) => state?.info;

// The reducer
export default infoSlice.reducer;

// Asynchronous thunk action
export function fetchInfo() {
  return async (dispatch: AppDispatch) => {
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

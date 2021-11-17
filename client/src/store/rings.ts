import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";
interface InitialState {
  loadingRings: boolean;
  hasErrors: boolean;
  rings: any;
}

export const initialState: InitialState = {
  loadingRings: true,
  hasErrors: false,
  rings: [],
};

// A slice for rings with our three reducers
const ringsSlice = createSlice({
  name: "rings",
  initialState,
  reducers: {
    getRings: (state) => {
      state.loadingRings = true;
    },
    getRingsSuccess: (state, { payload }) => {
      state.rings = payload;
      state.loadingRings = false;
      state.hasErrors = false;
    },
    getRingsFailure: (state) => {
      state.loadingRings = false;
      state.hasErrors = true;
    },
  },
});

// Three actions generated from the slice
export const { getRings, getRingsSuccess, getRingsFailure } =
  ringsSlice.actions;

// Selectors
export const ringsSelector = (state: RootState) => state.rings;

// The reducer
export default ringsSlice.reducer;

// Asynchronous thunk action
// export function fetchRings() {
//   return async (dispatch: AppDispatch) => {
//     dispatch(getRings());

//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/info`
//       );
//       const data = await response.json();

//       console.log(data);

//       dispatch(getRingsSuccess(data));
//     } catch (error) {
//       dispatch(getRingsFailure());
//     }
//   };
// }
export function fetchRings(authHeader) {
  return async (dispatch: AppDispatch) => {
    console.log(authHeader());
    dispatch(getRings());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/rings`,
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      );
      const { data } = await response.json();

      console.log(data);

      dispatch(getRingsSuccess(data.rings));
    } catch (error) {
      console.log(error);
      dispatch(getRingsFailure());
    }
  };
}

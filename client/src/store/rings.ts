import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "reapop";
import { makeRequest } from "src/helpers/makeRequest";

interface InitialState {
  loadingRings: boolean;
  loadingRingInfo: boolean;
  loadingRing: boolean;
  hasErrors: boolean;
  rings: Array<IRing>;
  ringVersions: Array<IRing>;
}

const initialState: InitialState = {
  loadingRings: false,
  loadingRingInfo: false,
  loadingRing: false,
  hasErrors: false,
  rings: [],
  ringVersions: [],
};

// A slice for rings with our three reducers
const ringsSlice = createSlice({
  name: "rings",
  initialState,
  reducers: {
    getRings: (state) => ({
      ...state,
      loadingRings: true,
    }),
    getRingsSuccess: (state, { payload }) => ({
      ...state,
      rings: payload,
      loadingRings: false,
      hasErrors: false,
    }),
    getRingsFailure: (state) => ({
      ...state,
      loadingRings: false,
      hasErrors: true,
    }),
    getRingVersions: (state) => ({
      ...state,
      loadingRing: true,
    }),
    getRingVersionsSuccess: (state, { payload }) => ({
      ...state,
      ringVersions: payload,
      loadingRing: false,
      hasErrors: false,
    }),
    getRingVersionsFailure: (state) => ({
      ...state,
      loadingRing: false,
      hasErrors: true,
    }),
    createRing: (state) => ({
      ...state,
      loadingRing: true,
    }),
    createRingSuccess: (state, { payload }) => ({
      ...state,
      ringVersions: payload,
      loadingRing: false,
      loadingRings: false,
      hasErrors: false,
    }),
    createRingFailure: (state) => ({
      ...state,
      loadingRing: false,
      hasErrors: true,
    }),
    getRingInfo: (state) => ({
      ...state,
      loadingRingInfo: true,
    }),
    getRingInfoSuccess: (state, { payload }) => ({
      ...state,
      rings: state.rings.map((ring) => {
        return ring.rid === payload.rid
          ? { ...ring, info: payload.info }
          : ring;
      }),
      loadingRingInfo: false,
      hasErrors: false,
    }),
    getRingInfoFailure: (state) => ({
      ...state,
      loadingRingInfo: false,
      hasErrors: true,
    }),
    deleteRing: (state) => ({
      ...state,
      loadingRing: true,
    }),
    deleteRingSuccess: (state, { payload }) => ({
      ...state,
      rings: state.rings.filter((ring) => {
        return ring.rid !== payload.rid;
      }),
      loadingRing: false,
      hasErrors: false,
    }),
    deleteRingFailure: (state) => ({
      ...state,
      loadingRing: false,
      hasErrors: true,
    }),
  },
});

// Three actions generated from the slice
export const ringsActions = ringsSlice.actions;

// Selectors
export const ringsSelector = (state: RootState) => state?.rings;
export const ringSelector = (state: RootState, rid: string) => {
  return state?.rings?.rings?.find((ring) => ring.rid === rid);
};
export const ringInfoSelector = (state: RootState, rid: string) => {
  return state?.rings?.rings?.find((ring) => ring.rid === rid)?.info;
};

// The reducer
export default ringsSlice.reducer;

// Async actions

// Create or add version to existing ring
export const createRing = (params) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(ringsActions.getRings());

      const response = await makeRequest.post(`/api/rings`, params);

      const { data } = response;

      if (response.status === "OK") {
        dispatch(ringsActions.createRingSuccess(data.versions));
        const message =
          data.versions.length === 1 ? "Ring Created!" : "Ring Version Saved!";

        dispatch(notify(message, "success"));
      } else {
        dispatch(ringsActions.createRingFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(ringsActions.createRingFailure());
    }
  };
};

export const getRings = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(ringsActions.getRings());

      const response = await makeRequest.get(`/api/rings`);
      const { data } = response;

      if (response.status === "OK") {
        dispatch(ringsActions.getRingsSuccess(data.rings));
      } else {
        dispatch(ringsActions.getRingsFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(ringsActions.getRingsFailure());
    }
  };
};

export const getRingVersions = (rid) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(ringsActions.getRingVersions());

      const response = await makeRequest.get(`/api/rings/${rid}`);
      const { data } = response;

      if (response.status === "OK") {
        dispatch(ringsActions.getRingVersionsSuccess(data.versions));
      } else {
        dispatch(ringsActions.getRingVersionsFailure());
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(ringsActions.getRingsFailure());
    }
  };
};

export const getRingInfo = (rid: string, version: number) => {
  return async (dispatch: AppDispatch) => {
    const failedToGetRingInfoNotification = (
      message = "Failed to get ring info!",
    ) => dispatch(notify(message, "error"));

    try {
      dispatch(ringsActions.getRingInfo());
      const response = await makeRequest.get(`/proxy/rings/${rid}/${version}`);
      if (response) {
        dispatch(
          ringsActions.getRingInfoSuccess({
            rid,
            info: response,
          }),
        );
      } else {
        failedToGetRingInfoNotification("Failed to get ring info!");
        dispatch(ringsActions.getRingInfoFailure());
      }
    } catch (error) {
      failedToGetRingInfoNotification();
      dispatch(ringsActions.getRingInfoFailure());
    }
  };
};

export const deleteRing = (rid: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await makeRequest.delete(`/api/rings/${rid}`);

      if (response) {
        dispatch(ringsActions.deleteRingSuccess({ rid, info: response }));
        dispatch(notify("Ring Deleted!", "success"));
      } else {
        dispatch(ringsActions.deleteRingFailure());
      }
    } catch (error) {
      dispatch(ringsActions.deleteRingFailure());
    }
  };
};

// Hooks
export const useRings = () => {
  const { rings, loadingRings, hasErrors, loadingRingInfo } =
    useSelector(ringsSelector);
  const dispatch = useDispatch();

  return {
    ringsActions,
    rings,
    loadingRings,
    loadingRingInfo,
    hasErrors,
    getRings: () => dispatch(getRings()),
    getRingInfo: (rid: string, version: number) => {
      return dispatch(getRingInfo(rid, version));
    },
  };
};

export const useRing = (rid) => {
  const ring = useSelector((state: RootState) => ringSelector(state, rid));
  const { loadingRing } = useSelector(ringsSelector);
  const info = useSelector((state: RootState) => ringInfoSelector(state, rid));
  const ringVersions = useSelector(
    (state: RootState) => state.rings.ringVersions,
  );
  const { loadingRingInfo } = useSelector(ringsSelector);
  const dispatch = useDispatch();

  return {
    ring,
    info,
    loadingRing,
    ringVersions,
    loadingRingInfo,
    getRingInfo: (version: number) => dispatch(getRingInfo(ring.rid, version)),
    createRing: (params: Record<string, unknown>) =>
      dispatch(createRing(params)),
    getRingVersions: (rid: string) => dispatch(getRingVersions(rid)),
    clearRingVersions: () => dispatch(ringsActions.getRingVersionsSuccess([])),
    deleteRing: (rid: string) => dispatch(deleteRing(rid)),
  };
};

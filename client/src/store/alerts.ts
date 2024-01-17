import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { useSelector, useDispatch } from "react-redux";
import { notify } from "reapop";
import { PagingT } from "src/types/paging";
import { ConnectionT } from "./connection";
import { UserT } from "./user";

import { makeRequest } from "src/helpers/makeRequest";

export type AlertT = {
  id: number;
  userId: number;
  initiatorUserId: number;
  initiatorUser?: UserT;
  notebookId: number | null;
  viewed: boolean;
  connection?: ConnectionT;
  connectionId?: number;
  createdAt: string;
  updatedAt: string;
};

type InitialStateT = {
  alerts: AlertT[];
  paging: PagingT;
  loadingAlerts: boolean;
  hasErrors: boolean;
};

export const initialState: InitialStateT = {
  alerts: [],
  paging: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
  },
  loadingAlerts: false,
  hasErrors: false,
};

// Slice
const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    fetchAlerts: (state) => ({
      ...state,
      loadingAlerts: true,
    }),
    fetchAlertsSuccess: (state, { payload }) => {
      return {
        ...state,
        loadingAlerts: false,
        hasErrors: false,
        alerts: payload.alerts,
        paging: payload.paging,
      };
    },
    fetchAlertsFailure: (state) => ({
      ...state,
      loadingAlerts: false,
      hasErrors: true,
    }),
    updateAlertSuccess: (state, { payload }) => ({
      ...state,
      alerts: state.alerts.map((alert) =>
        alert.id === payload.id
          ? { ...alert, ...payload, updatingAlert: false }
          : alert,
      ),
      hasErrors: false,
    }),
    updateAlertFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    createAlertSuccess: (state, { payload }) => ({
      ...state,
      alerts: [payload, ...state.alerts],
      hasErrors: false,
    }),
    createAlertFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
  },
});

// Actions
export const alertActions = alertSlice.actions;

// Selectors
export const alertsSelector = (state: RootState) => state.alerts.alerts;
export const alertsPagingSelector = (state: RootState) => state.alerts.paging;

// The reducer
export default alertSlice.reducer;

// Asynchronous thunk actions
export const fetchAlerts = (params) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(alertActions.fetchAlerts());

      const { data, message, code } = await makeRequest.get(`/api/alerts`, {
        params,
      });

      if (code === 200) {
        dispatch(alertActions.fetchAlertsSuccess(data));
      } else {
        dispatch(notify(message, "error"));
        dispatch(alertActions.fetchAlertsFailure());
      }
    } catch (error) {
      dispatch(alertActions.fetchAlertsFailure());
    }
  };
};

export const updateAlert = (alertId, payload: any = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.put(
        `/api/alerts/${alertId}`,
        payload,
      );
      if (code === 200) {
        dispatch(alertActions.updateAlertSuccess(data.alert));
      } else {
        dispatch(notify(message, "error"));
        dispatch(alertActions.updateAlertFailure());
      }
    } catch (error) {
      dispatch(alertActions.updateAlertFailure());
    }
  };
};

export const createAlert = (payload: any = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.post(
        `/api/alerts/create`,
        { ...payload },
      );

      if (code === 200) {
        dispatch(alertActions.createAlertSuccess(data.newAlert));
      } else {
        dispatch(notify(message, "error"));
        dispatch(alertActions.createAlertFailure());
      }
    } catch (error) {
      dispatch(alertActions.createAlertFailure());
    }
  };
};

// Hooks
export const useAlert = () => {
  const alerts = useSelector(alertsSelector);
  const alertsPaging = useSelector(alertsPagingSelector);
  const dispatch = useDispatch();

  return {
    alerts,
    alertsPaging,
    fetchAlerts: (payload: any = {}) => dispatch(fetchAlerts(payload)),
    createAlert: (payload: any = {}) => dispatch(createAlert(payload)),
    updateAlert: (alertId, payload: any = {}) =>
      dispatch(updateAlert(alertId, payload)),
  };
};

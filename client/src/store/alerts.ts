import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { useSelector, useDispatch } from "react-redux";
import { notify } from "reapop";
import type { PagingT } from "src/types/paging";
import type { ConnectionT } from "./connection";
import type { UserT } from "./user";
import type { TeamT } from "./team";
import type { NotebookT } from "./notebook";

import { makeRequest } from "src/helpers/makeRequest";

export type AlertT = {
  id: number;
  userId: number;
  initiatorUserId: number;
  initiatorUser?: UserT;
  notebookId: number | null;
  notebook: NotebookT;
  viewed: boolean;
  connection?: ConnectionT;
  connectionId?: number;
  team?: TeamT;
  teamId?: number;
  createdAt: string;
  updatedAt: string;
  ringLabel?: string;
  deletedNotebookName?: string;
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
    deleteAlertSuccess: (state, { payload }) => ({
      ...state,
      alerts: state.alerts.filter((alert) => alert.id !== payload.id),
      hasErrors: false,
    }),
    deleteAlertFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    deleteAllAlertsFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    deleteAllAlertsSuccess: (state) => ({
      ...state,
      alerts: [],
      hasErrors: false,
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

export const updateAlert = (alertId, payload: Record<string, unknown> = {}) => {
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

export const createAlert = (payload: Record<string, unknown> = {}) => {
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

export const deleteAlert = (alertId) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { code } = await makeRequest.delete(`/api/alerts/${alertId}`);
      if (code === 200) {
        dispatch(alertActions.deleteAlertSuccess({ id: alertId }));
      } else {
        dispatch(alertActions.deleteAlertFailure());
      }
    } catch (error) {
      dispatch(alertActions.deleteAlertFailure());
    }
  };
};

export const deleteAllAlerts = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const { code } = await makeRequest.post(`/api/alerts/deleteAll`, {});

      if (code === 200) {
        dispatch(alertActions.deleteAllAlertsSuccess());
      } else {
        dispatch(alertActions.deleteAllAlertsFailure());
      }
    } catch (error) {
      dispatch(alertActions.deleteAllAlertsFailure());
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
    fetchAlerts: (payload: Record<string, unknown> = {}) =>
      dispatch(fetchAlerts(payload)),
    createAlert: (payload: Record<string, unknown> = {}) =>
      dispatch(createAlert(payload)),
    updateAlert: (alertId, payload: Record<string, unknown> = {}) =>
      dispatch(updateAlert(alertId, payload)),
    deleteAlert: (alertId) => dispatch(deleteAlert(alertId)),
    deleteAllAlerts: () => dispatch(deleteAllAlerts()),
  };
};

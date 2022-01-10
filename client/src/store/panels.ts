import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";
import { authSelector, authorizationHeader } from "./auth";
import { notebookSelector } from "./notebook";
import { notify } from "reapop";
import { useSelector, useDispatch } from "react-redux";

interface InitialState {
  loadingPanels: boolean;
  creatingPanel: boolean;
  updatingPanel: boolean;
  deletingPanel: boolean;
  hasErrors: boolean;
  panels: any;
}

export const initialState: InitialState = {
  loadingPanels: true,
  creatingPanel: false,
  updatingPanel: false,
  deletingPanel: false,
  hasErrors: false,
  panels: [],
};

const panelsSlice = createSlice({
  name: "panels",
  initialState,
  reducers: {
    getPanels: (state) => ({
      ...state,
      loadingPanels: true
    }),
    getPanelsSuccess: (state, { payload }) => ({
      ...state,
      panels: payload,
      loadingPanels: false,
      hasErrors: false,
    }),
    getPanelsFailure: (state) => ({
      ...state,
      loadingPanels: false,
      hasErrors: true,
    }),
    createNewPanel: (state) => ({
      ...state,
      creatingPanel: true,
    }),
    createNewPanelSuccess: (state, { payload }) => ({
      ...state,
      panels: [...state.panels, payload],
      creatingPanel: false,
      hasErrors: false,
    }),
    createNewPanelFailure: (state) => ({
      ...state,
      creatingPanel: false,
      hasErrors: true,
    }),
    updatingPanel: (state) => ({
      ...state,
      updatingPanel: true,
    }),
    updatingPanelSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) => panel.id === payload.id ? payload : panel),
      updatingPanel: false,
      hasErrors: false,
    }),
    updatingPanelFailure: (state) => ({
      ...state,
      updatingPanel: false,
      hasErrors: true,
    }),
    deletingPanel: (state) => ({
      ...state,
      deletingPanel: true,
    }),
    deletingPanelSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.filter((panel) => panel.id !== payload),
      deletingPanel: false,
      hasErrors: false,
    }),
    deletingPanelFailure: (state) => ({
      ...state,
      deletingPanel: false,
      hasErrors: true,
    }),
  },
});

// Three actions generated from the slice
export const { getPanels, getPanelsSuccess, getPanelsFailure, createNewPanel, createNewPanelSuccess, createNewPanelFailure, updatingPanel, updatingPanelSuccess, updatingPanelFailure, deletingPanel, deletingPanelSuccess, deletingPanelFailure } = panelsSlice.actions;

// Selectors
export const panelsSelector = (state: RootState) => state.panels;

// The reducer
export default panelsSlice.reducer;

export const fetchPanels = () => {
  return async (dispatch: AppDispatch, getState) => {
    try {
      const { token } = authSelector(getState());
      const { notebook } = notebookSelector(getState());
      const authHeader = authorizationHeader(token);
      dispatch(getPanels());

      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${notebook.id}/panels`,
        {
          method: "GET",
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      const { data, message } = await response.json();
      if (response.status === 200) {
        dispatch(getPanelsSuccess(data.panels));
      } else {
        dispatch(notify(message, "error"));
        dispatch(getPanelsFailure());
      }
    } catch (error) {
      dispatch(getPanelsFailure());
    }
  };
}

export const createPanel = (payload: any = {}) => async (dispatch: AppDispatch, getState) => {
  try {
    const { token, user } = authSelector(getState());
    const { notebook } = notebookSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(createNewPanel());

    const response = await fetch(
      `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/panels`,
      {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          notebookId: notebook.id,
          userId: user.id,
        }),
      }
    );

    const { data, message } = await response.json();
    if (response.status === 200) {
      dispatch(notify(message, "success"));
      dispatch(createNewPanelSuccess(data));
    } else {
      dispatch(notify(message, "error"));
      dispatch(createNewPanelFailure());
    }
  } catch (error) {
    dispatch(createNewPanelFailure());
  }
}

export const updatePanel = (panelId, payload: any = {}) => async (dispatch: AppDispatch, getState) => {
  try {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(updatingPanel());

    const response = await fetch(
      `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/panels/${panelId}`,
      {
        method: "PUT",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const { data, message } = await response.json();
    if (response.status === 200) {
      dispatch(notify(message, "success"));
      dispatch(updatingPanelSuccess(data));
    } else {
      dispatch(notify(message, "error"));
      dispatch(updatingPanelFailure());
    }
  } catch (error) {
    dispatch(updatingPanelFailure());
  }
}

export const deletePanel = (panelId) => async (dispatch: AppDispatch, getState) => {
  try {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(deletingPanel());

    const response = await fetch(
      `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/panels/${panelId}`,
      {
        method: "DELETE",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    const { data, message } = await response.json();
    if (response.status === 200) {
      dispatch(notify(message, "success"));
      dispatch(deletingPanelSuccess(panelId));
    } else {
      dispatch(notify(message, "error"));
      dispatch(deletingPanelFailure());
    }
  } catch (error) {
    dispatch(deletingPanelFailure());
  }
}
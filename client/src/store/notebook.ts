/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { notify } from "reapop";
import { useUnknownErrorNotificationMessage } from "src/components/Notifications";
import { useSelector, useDispatch } from "react-redux";
import { makeRequest } from "src/helpers/makeRequest";

interface InitialState {
  loadingNotebook: boolean;
  creatingNotebook: boolean;
  savingNotebook: boolean;
  deletingNotebook: boolean;
  hasErrors: boolean;
  notebook: any;
}

export const initialState: InitialState = {
  loadingNotebook: true,
  savingNotebook: false,
  creatingNotebook: false,
  deletingNotebook: false,
  hasErrors: false,
  notebook: null,
};

const notebookSlice = createSlice({
  name: "notebook",
  initialState,
  reducers: {
    getNotebook: (state) => ({
      ...state,
      loadingNotebook: true,
    }),
    getNotebookSuccess: (state, { payload }) => ({
      ...state,
      notebook: payload,
      loadingNotebook: false,
      hasErrors: false,
    }),
    getNotebookFailure: (state) => ({
      ...state,
      loadingNotebook: false,
      hasErrors: true,
    }),
    clearNotebook: (state) => ({
      ...state,
      notebook: null,
      loadingNotebook: false,
    }),
    createNotebook: (state) => ({
      ...state,
      creatingNotebook: true,
      hasErrors: false,
    }),
    createNotebookSuccess: (state, { payload }) => ({
      ...state,
      notebook: payload,
      creatingNotebook: false,
      hasErrors: false,
    }),
    createNotebookFailure: (state) => ({
      ...state,
      creatingNotebook: false,
      hasErrors: true,
    }),
    saveNotebook: (state) => ({
      ...state,
      savingNotebook: true,
    }),
    saveNotebookSuccess: (state, { payload }) => ({
      ...state,
      notebook: { ...state.notebook, ...payload },
      savingNotebook: false,
      hasErrors: false,
    }),
    saveNotebookFailure: (state) => ({
      ...state,
      savingNotebook: false,
      hasErrors: true,
    }),
    removeNotebook: (state) => ({
      ...state,
      deletingNotebook: true,
    }),
    removeNotebookSuccess: (state) => ({
      ...state,
      deletingNotebook: false,
      hasErrors: false,
      notebook: null,
    }),
    removeNotebookFailure: (state) => ({
      ...state,
      deletingNotebook: false,
      hasErrors: true,
    }),
  },
});

// Three actions generated from the slice
export const notebookActions = notebookSlice.actions;

// Selectors
export const notebookSelector = (state: RootState) => state.notebook;

// The reducer
export default notebookSlice.reducer;

export function fetchNotebook(id: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(notebookActions.getNotebook());

    try {
      const response = await makeRequest.get(`/api/notebooks/${id}`);

      if (response.code === 200) {
        const { data } = response;
        dispatch(notebookActions.getNotebookSuccess(data.notebook));
      } else {
        dispatch(notebookActions.getNotebookFailure());
      }
    } catch (error) {
      dispatch(notebookActions.getNotebookFailure());
    }
  };
}

export function updateNotebook(id: string, payload: any) {
  return async (dispatch: AppDispatch, getState) => {
    dispatch(notebookActions.saveNotebook());

    try {
      const response = await makeRequest.put(`/api/notebooks/${id}`, payload);
      if (response.code === 200) {
        const { data, message } = response;
        dispatch(notify(message, "success"));
        dispatch(notebookActions.saveNotebookSuccess(data.notebook));
      } else {
        dispatch(notify(response.statusText, "error"));
        dispatch(notebookActions.saveNotebookFailure());
      }
    } catch (error) {
      dispatch(notify(useUnknownErrorNotificationMessage, "error"));
      dispatch(notebookActions.saveNotebookFailure());
    }
  };
}

export function createNotebook(payload: any) {
  return async (dispatch: AppDispatch, getState) => {
    dispatch(notebookActions.createNotebook());
    try {
      const response = await makeRequest.post(`/api/notebooks`, payload);
      const { data, message } = response;
      if (response.code === 200) {
        // dispatch(notify(message, "success"));
        dispatch(notebookActions.createNotebookSuccess(data.notebook));
      } else {
        dispatch(notify(message, "error"));
        dispatch(notebookActions.createNotebookFailure());
      }
    } catch (error) {
      dispatch(notebookActions.createNotebookFailure());
    }
  };
}

export function deleteNotebook(id: string) {
  return async (dispatch: AppDispatch, getState) => {
    dispatch(notebookActions.removeNotebook());
    try {
      const response = await makeRequest.delete(`/api/notebooks/${id}`);
      const { message } = response;
      if (response.code === 200) {
        dispatch(notebookActions.clearNotebook());
        dispatch(notify(message, "success"));
        dispatch(notebookActions.removeNotebookSuccess());
      } else {
        dispatch(notify(message, "error"));
        dispatch(notebookActions.removeNotebookFailure());
      }
    } catch (error) {
      dispatch(notebookActions.removeNotebookFailure());
    }
  };
}

// Hooks
export function useNotebook() {
  const { notebook, loadingNotebook, hasErrors } =
    useSelector(notebookSelector);
  const dispatch = useDispatch();
  return {
    notebook,
    loadingNotebook,
    hasErrors,
    fetchNotebook: (id: string) => dispatch(fetchNotebook(id)),
    updateNotebook: (id: string, payload: any) =>
      dispatch(updateNotebook(id, payload)),
    createNotebook: (payload: any) => dispatch(createNotebook(payload)),
    deleteNotebook: (id: string) => dispatch(deleteNotebook(id)),
  };
}

export const useNotebookId = () => {
  const { notebook } = useSelector(notebookSelector);
  return notebook?.id;
};

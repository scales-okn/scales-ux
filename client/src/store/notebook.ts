/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { notify } from "reapop";
import { useUnknownErrorNotificationMessage } from "src/components/Notifications";
import { useSelector, useDispatch } from "react-redux";
import { makeRequest } from "src/helpers/makeRequest";
import { PagingT } from "src/types/paging";
interface InitialState {
  loadingNotebook: boolean;
  creatingNotebook: boolean;
  savingNotebook: boolean;
  deletingNotebook: boolean;
  notebook: any;
  loadingNotebooks: boolean;
  hasErrors: boolean;
  notebooks: any;
  paging: PagingT;
}

export const initialState: InitialState = {
  loadingNotebook: true,
  savingNotebook: false,
  creatingNotebook: false,
  deletingNotebook: false,
  hasErrors: false,
  notebook: null,
  loadingNotebooks: true,
  notebooks: [],
  paging: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
  },
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
      notebooks: state.notebooks.map((notebook) => {
        if (notebook.id === payload.id) {
          return payload;
        } else {
          return notebook;
        }
      }),
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
    removeNotebookSuccess: (state, action) => ({
      ...state,
      deletingNotebook: false,
      hasErrors: false,
      notebook: null,
      notebooks: state.notebooks.filter(
        (notebook) => notebook.id !== action.payload.id,
      ),
    }),
    removeNotebookFailure: (state) => ({
      ...state,
      deletingNotebook: false,
      hasErrors: true,
    }),
    fetchNotebooks: (state) => ({
      ...state,
      loadingNotebooks: true,
    }),
    fetchNotebooksSuccess: (state, { payload }) => ({
      ...state,
      notebooks: payload.notebooks,
      loadingNotebooks: false,
      hasErrors: false,
      paging: payload.paging,
    }),
    fetchNotebooksFailure: (state) => ({
      ...state,
      loadingNotebooks: false,
      hasErrors: true,
    }),
    shareNotebookLink: (state) => ({
      ...state,
    }),
    shareNotebookLinkSuccess: (state) => ({
      ...state,
      hasErrors: false,
    }),
    shareNotebookLinkFailure: (state) => ({
      ...state,
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

export function fetchNotebooks(params) {
  return async (dispatch: AppDispatch) => {
    dispatch(notebookActions.fetchNotebooks());

    try {
      const { data } = await makeRequest.get(`/api/notebooks`, {
        params,
      });

      dispatch(notebookActions.fetchNotebooksSuccess(data));
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(notebookActions.fetchNotebooksFailure());
    }
  };
}

export function fetchNotebook(id: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(notebookActions.getNotebook());

    try {
      const response = await makeRequest.get(`/api/notebooks/${id}`);

      if (response.status === "OK") {
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
      if (response.status === "OK") {
        const { data } = response;
        // dispatch(notify(message, "success"));
        dispatch(notebookActions.saveNotebookSuccess(data));
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
      if (response.status === "OK") {
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
      if (response.status === "OK") {
        dispatch(notebookActions.clearNotebook());
        dispatch(notify(message, "success"));
        dispatch(notebookActions.removeNotebookSuccess({ id }));
      } else {
        dispatch(notify(message, "error"));
        dispatch(notebookActions.removeNotebookFailure());
      }
    } catch (error) {
      dispatch(notebookActions.removeNotebookFailure());
    }
  };
}

export function shareNotebookLink(
  payload: any = { id: "", email: "", message: "" },
) {
  return async (dispatch: AppDispatch, getState) => {
    dispatch(notebookActions.shareNotebookLink());
    try {
      const response = await makeRequest.post(
        `/api/notebooks/shareLink`,
        payload,
      );
      const { message } = response;
      if (response.status === "OK") {
        dispatch(notify(message, "success"));
      } else {
        dispatch(notify(message, "error"));
      }
    } catch (error) {
      dispatch(notify("Something went wrong", "error"));
    }
  };
}

// Hooks
export function useNotebook() {
  const {
    notebook,
    loadingNotebook,
    savingNotebook,
    deletingNotebook,
    hasErrors,
    loadingNotebooks,
    notebooks,
    paging,
  } = useSelector(notebookSelector);

  const dispatch = useDispatch();
  return {
    notebooks,
    paging,
    loadingNotebooks,
    notebook,
    loadingNotebook,
    savingNotebook,
    deletingNotebook,
    hasErrors,
    clearNotebook: () => dispatch(notebookActions.clearNotebook()),
    fetchNotebooks: (payload: any) => dispatch(fetchNotebooks(payload)),
    fetchNotebook: (id: string) => dispatch(fetchNotebook(id)),
    updateNotebook: (id: string, payload: any) =>
      dispatch(updateNotebook(id, payload)),
    createNotebook: (payload: any) => dispatch(createNotebook(payload)),
    deleteNotebook: (id: string) => dispatch(deleteNotebook(id)),
    shareNotebookLink: (payload: any) => dispatch(shareNotebookLink(payload)),
  };
}

export const useNotebookId = () => {
  const { notebook } = useSelector(notebookSelector);
  return notebook?.id;
};

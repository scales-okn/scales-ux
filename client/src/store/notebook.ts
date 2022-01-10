import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";
import { authSelector, authorizationHeader } from "./auth";
import { notify } from "reapop";
import { useUnknownErrorNotificationMessage } from "../components/Notifications";
import { useSelector, useDispatch } from "react-redux";

interface InitialState {
  loadingNotebook: boolean;
  savingNotebook: boolean;
  deletingNotebook: boolean;
  hasErrors: boolean;
  notebook: any;
}

export const initialState: InitialState = {
  loadingNotebook: true,
  savingNotebook: false,
  deletingNotebook: false,
  hasErrors: false,
  notebook: null,
};

const notebooksSlice = createSlice({
  name: "notebook",
  initialState,
  reducers: {
    getNotebook: (state) => ({
      ...state,
      loadingNotebook: true
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
    }),
    saveNotebook: (state) => ({
      ...state,
      savingNotebook: true,
    }),
    saveNotebookSuccess: (state, { payload }) => ({
      ...state,
      notebook: payload,
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
export const {
  getNotebook,
  getNotebookSuccess,
  getNotebookFailure,
  clearNotebook,
  saveNotebook,
  saveNotebookFailure,
  saveNotebookSuccess,
  removeNotebook,
  removeNotebookSuccess,
  removeNotebookFailure,
} = notebooksSlice.actions;

// Selectors
export const notebookSelector = (state: RootState) => state.notebook;

// The reducer
export default notebooksSlice.reducer;

export function fetchNotebook(id: string) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);

    dispatch(getNotebook());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        }
      );
      if (response.status === 200) {
        const { data } = await response.json();
        dispatch(getNotebookSuccess(data.notebook));
      } else {
        dispatch(getNotebookFailure());
      }
    } catch (error) {
      dispatch(getNotebookFailure());
    }
  };
}

export function updateNotebook(id: string, payload: any) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(saveNotebook());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.status === 200) {
        const { data, message } = await response.json();
        dispatch(notify(message, "success"));
        dispatch(saveNotebookSuccess(data));
      } else {
        dispatch(notify(response.statusText, "error"));
        dispatch(saveNotebookFailure());
      }
    } catch (error) {
      dispatch(notify(useUnknownErrorNotificationMessage, "error"));
      dispatch(saveNotebookFailure());
    }
  };
}

export function createNotebook(payload: any) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);

    dispatch(saveNotebook());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify(payload),
        }
      );
      const { data, message } = await response.json();
      if (response.status === 200) {
        dispatch(notify(message, "success"));
        dispatch(saveNotebookSuccess(data));
      } else {
        dispatch(notify(message, "error"));
        dispatch(saveNotebookFailure());
      }
    } catch (error) {
      dispatch(saveNotebookFailure());
    }
  };
}

export function deleteNotebook(id: string) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);

    dispatch(removeNotebook());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        }
      );
      const { message } = await response.json();
      if (response.status === 200) {
        dispatch(notify(message, "success"));
        dispatch(removeNotebookSuccess());
      } else {
        dispatch(notify(message, "error"));
        dispatch(removeNotebookFailure());
      }
    } catch (error) {
      dispatch(removeNotebookFailure());
    }
  };
}

// Hooks
export function useNotebook() {
  const { notebook, loadingNotebook, hasErrors } = useSelector(notebookSelector);
  const dispatch = useDispatch();

  return {
    notebook,
    loadingNotebook,
    hasErrors,
    fetchNotebook: (id: string) => dispatch(fetchNotebook(id)),
    updateNotebook: (id: string, payload: any) => dispatch(updateNotebook(id, payload)),
    createNotebook: (payload: any) => dispatch(createNotebook(payload)),
    deleteNotebook: (id: string) => dispatch(deleteNotebook(id)),
  };
}

export const useNotebookId = () => {
  const { notebook } = useSelector(notebookSelector);
  return notebook?.id;
}

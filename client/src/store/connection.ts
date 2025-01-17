import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { useSelector, useDispatch } from "react-redux";
import { notify } from "reapop";
import type { PagingT } from "src/types/paging";
import type { UserT } from "src/types/user";
import type { ConnectionT } from "src/types/connection";

import { makeRequest } from "src/helpers/makeRequest";

type InitialStateT = {
  connections: ConnectionT[];
  approvedConnectionUsers: UserT[];
  paging: PagingT;
  loadingConnections: boolean;
  hasErrors: boolean;
};

export const initialState: InitialStateT = {
  connections: [],
  approvedConnectionUsers: [],
  paging: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
  },
  loadingConnections: false,
  hasErrors: false,
};

// Slice
const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    fetchConnections: (state) => ({
      ...state,
      loadingConnections: true,
    }),
    fetchConnectionsSuccess: (state, { payload }) => {
      return {
        ...state,
        loadingConnections: false,
        hasErrors: false,
        connections: payload.connections,
        paging: payload.paging,
      };
    },
    fetchConnectionsFailure: (state) => ({
      ...state,
      loadingConnections: false,
      hasErrors: true,
    }),
    findAllApprovedConnectionUsers: (state) => ({
      ...state,
      loadingConnections: true,
    }),
    findAllApprovedConnectionUsersSuccess: (state, { payload }) => {
      return {
        ...state,
        loadingConnections: false,
        hasErrors: false,
        approvedConnectionUsers: payload,
      };
    },
    findAllApprovedConnectionUsersFailure: (state) => ({
      ...state,
      loadingConnections: false,
      hasErrors: true,
    }),
    updateConnectionSuccess: (state, { payload }) => ({
      ...state,
      connections: state.connections.map((connection) =>
        connection.id === payload.id
          ? { ...connection, ...payload, updatingConnection: false }
          : connection,
      ),
      hasErrors: false,
    }),
    updateConnectionFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    deleteConnectionSuccess: (state, { payload }) => ({
      ...state,
      connections: state.connections.filter(
        (connection) => connection.id !== payload,
      ),
    }),
    deleteConnectionFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    createConnectionSuccess: (state, { payload }) => ({
      ...state,
      connections: [payload, ...state.connections],
      hasErrors: false,
    }),
    createConnectionFailure: (state, { payload }) => ({
      ...state,
      hasErrors: payload,
    }),
  },
});

// Actions
export const connectionActions = connectionSlice.actions;

// Selectors
export const connectionsSelector = (state: RootState) =>
  state.connections.connections;
export const approvedConnectionUsersSelector = (state: RootState) =>
  state.connections.approvedConnectionUsers;
export const connectionsPagingSelector = (state: RootState) =>
  state.connections.paging;
export const connectionsErrorsSelector = (state: RootState) =>
  state.connections.hasErrors;

// The reducer
export default connectionSlice.reducer;

// Asynchronous thunk actions
export const fetchConnections = (params) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(connectionActions.fetchConnections());

      const { data, message, code } = await makeRequest.get(
        `/api/connections`,
        {
          params,
        },
      );

      if (code === 200) {
        dispatch(connectionActions.fetchConnectionsSuccess(data));
      } else {
        dispatch(notify(message, "error"));
        dispatch(connectionActions.fetchConnectionsFailure());
      }
    } catch (error) {
      dispatch(connectionActions.fetchConnectionsFailure());
    }
  };
};

export const fetchApprovedConnectionUsers = (params) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { data, message, code } = await makeRequest.get(
        `/api/connections/findAllApprovedConnectionUsers`,
        { params },
      );

      if (code === 200) {
        dispatch(
          connectionActions.findAllApprovedConnectionUsersSuccess(
            data.connections,
          ),
        );
      } else {
        dispatch(notify(message, "error"));
        dispatch(connectionActions.fetchConnectionsFailure());
      }
    } catch (error) {
      dispatch(connectionActions.fetchConnectionsFailure());
    }
  };
};

export const updateConnection = (
  connectionId,
  payload: Record<string, unknown> = {},
) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.put(
        `/api/connections/${connectionId}`,
        payload,
      );
      if (code === 200) {
        dispatch(connectionActions.updateConnectionSuccess(data.connection));
      } else {
        dispatch(notify(message, "error"));
        dispatch(connectionActions.updateConnectionFailure());
      }
    } catch (error) {
      dispatch(connectionActions.updateConnectionFailure());
    }
  };
};

export const deleteConnection = (connectionId) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { message, code } = await makeRequest.delete(
        `/api/connections/${connectionId}`,
      );

      if (code === 200) {
        dispatch(connectionActions.deleteConnectionSuccess(connectionId));
      } else {
        dispatch(notify(message, "error"));
        dispatch(connectionActions.deleteConnectionFailure());
      }
    } catch (error) {
      dispatch(connectionActions.deleteConnectionFailure());
    }
  };
};

export const createConnection = (payload: Record<string, unknown> = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.post(
        `/api/connections/create`,
        { ...payload, isAdmin: true },
      );

      if (code === 200) {
        dispatch(connectionActions.createConnectionSuccess(data.newConnection));
      } else {
        dispatch(notify(message, "error"));
        dispatch(connectionActions.createConnectionFailure(message));
      }
    } catch (error) {
      dispatch(connectionActions.createConnectionFailure(error.message));
    }
  };
};

// Hooks
export const useConnection = () => {
  const connections = useSelector(connectionsSelector);
  const approvedConnectionUsers = useSelector(approvedConnectionUsersSelector);
  const connectionsPaging = useSelector(connectionsPagingSelector);
  const hasErrors = useSelector(connectionsErrorsSelector);
  const dispatch = useDispatch();

  return {
    connections,
    connectionsPaging,
    approvedConnectionUsers,
    hasErrors,
    fetchConnections: (payload: Record<string, unknown> = {}) =>
      dispatch(fetchConnections(payload)),
    fetchApprovedConnectionUsers: (payload: Record<string, unknown> = {}) =>
      dispatch(fetchApprovedConnectionUsers(payload)),
    createConnection: (payload: Record<string, unknown> = {}) =>
      dispatch(createConnection(payload)),
    updateConnection: (connectionId, payload: Record<string, unknown> = {}) =>
      dispatch(updateConnection(connectionId, payload)),
    deleteConnection: (connectionId) =>
      dispatch(deleteConnection(connectionId)),
  };
};

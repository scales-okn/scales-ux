import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { useSelector, useDispatch } from "react-redux";
import { notify } from "reapop";
import { PagingT } from "src/types/paging";
import { UserT } from "./user";

import { makeRequest } from "src/helpers/makeRequest";

export type ConnectionT = {
  id: number;
  senderId: number;
  recipientId: number;
  note: string;
  pending: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

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
    createConnectionSuccess: (state, { payload }) => ({
      ...state,
      connections: [payload, ...state.connections],
      hasErrors: false,
    }),
    createConnectionFailure: (state) => ({
      ...state,
      hasErrors: true,
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
        // Dispatch an action to update the state with other users
        dispatch(
          connectionActions.fetchConnectionsSuccess({
            connections: [],
            paging: {},
          }),
        );
        dispatch(connectionActions.findAllApprovedConnectionUsersSuccess(data));
      } else {
        dispatch(notify(message, "error"));
        dispatch(connectionActions.fetchConnectionsFailure());
      }
    } catch (error) {
      dispatch(connectionActions.fetchConnectionsFailure());
    }
  };
};

export const updateConnection = (connectionId, payload: any = {}) => {
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

export const createConnection = (payload: any = {}) => {
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
        dispatch(connectionActions.createConnectionFailure());
      }
    } catch (error) {
      dispatch(connectionActions.createConnectionFailure());
    }
  };
};

// Hooks
export const useConnection = () => {
  const connections = useSelector(connectionsSelector);
  const approvedConnectionUsers = useSelector(approvedConnectionUsersSelector);
  const connectionsPaging = useSelector(connectionsPagingSelector);
  const dispatch = useDispatch();

  return {
    connections,
    connectionsPaging,
    approvedConnectionUsers,
    fetchConnections: (payload: any = {}) =>
      dispatch(fetchConnections(payload)),
    fetchApprovedConnectionUsers: (payload: any = {}) =>
      dispatch(fetchApprovedConnectionUsers(payload)),
    createConnection: (payload: any = {}) =>
      dispatch(createConnection(payload)),
    updateConnection: (connectionId, payload: any = {}) =>
      dispatch(updateConnection(connectionId, payload)),
  };
};

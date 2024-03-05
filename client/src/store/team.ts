import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "src/store";
import { useSelector, useDispatch } from "react-redux";
import { notify } from "reapop";
import type { UserT } from "./user";
import type { NotebookT } from "./notebook";

import { makeRequest } from "src/helpers/makeRequest";

type UserWithRoleT = UserT & {
  UserTeams: {
    role: string;
  };
};

type UpdateTeamT = {
  userIdToAdd?: number;
  userIdToRemove?: number;
  userIdToUpdate?: number;
  newUserRole?: string;
  description?: string;
  name?: string;
};

export type TeamT = {
  id: number;
  name: string;
  description: string;
  users: UserWithRoleT[];
  notebooks: NotebookT[];
  createdAt: string;
  updatedAt: string;
};

type InitialStateT = {
  teams: TeamT[];
  loadingTeams: boolean;
  hasErrors: boolean;
};

export const initialState: InitialStateT = {
  teams: [],
  loadingTeams: false,
  hasErrors: false,
};

// Slice
const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    fetchTeams: (state) => ({
      ...state,
      loadingTeams: true,
    }),
    fetchTeamsSuccess: (state, { payload }) => {
      return {
        ...state,
        loadingTeams: false,
        hasErrors: false,
        teams: payload,
      };
    },
    fetchTeamsFailure: (state) => ({
      ...state,
      loadingTeams: false,
      hasErrors: true,
    }),
    updateTeamSuccess: (state, { payload }) => ({
      ...state,
      teams: state.teams.map((team) =>
        team.id === payload.id
          ? { ...team, ...payload, updatingTeam: false }
          : team,
      ),
      hasErrors: false,
    }),
    updateTeamFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    deleteTeamSuccess: (state, { payload }) => ({
      ...state,
      teams: state.teams.filter((team) => team.id !== payload),
      hasErrors: false,
    }),
    deleteTeamFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
    createTeamSuccess: (state, { payload }) => ({
      ...state,
      teams: [payload, ...state.teams],
      hasErrors: false,
    }),
    createTeamFailure: (state) => ({
      ...state,
      hasErrors: true,
    }),
  },
});

// Actions
export const teamActions = teamSlice.actions;

// Selectors
export const teamsSelector = (state: RootState) => state.teams.teams;

// The reducer
export default teamSlice.reducer;

// Asynchronous thunk actions
export const fetchTeams = (params) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(teamActions.fetchTeams());

      const { data, message, code } = await makeRequest.get(`/api/teams`, {
        params,
      });

      if (code === 200) {
        dispatch(teamActions.fetchTeamsSuccess(data.teams));
      } else {
        dispatch(notify(message, "error"));
        dispatch(teamActions.fetchTeamsFailure());
      }
    } catch (error) {
      dispatch(teamActions.fetchTeamsFailure());
    }
  };
};

export const updateTeam = (teamId, payload: UpdateTeamT = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.put(
        `/api/teams/${teamId}`,
        payload,
      );
      if (code === 200) {
        dispatch(teamActions.updateTeamSuccess(data.team));
      } else {
        dispatch(notify(message, "error"));
        dispatch(teamActions.updateTeamFailure());
      }
    } catch (error) {
      dispatch(teamActions.updateTeamFailure());
    }
  };
};

export const deleteTeam = (teamId, payload: UpdateTeamT = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { message, code } = await makeRequest.delete(
        `/api/teams/${teamId}`,
        payload,
      );
      if (code === 200) {
        dispatch(teamActions.deleteTeamSuccess(teamId));
      } else {
        dispatch(notify(message, "error"));
        dispatch(teamActions.deleteTeamFailure());
      }
    } catch (error) {
      dispatch(teamActions.deleteTeamFailure());
    }
  };
};

export const createTeam = (payload: Record<string, unknown> = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, message, code } = await makeRequest.post(
        `/api/teams`,
        payload,
      );

      if (code === 200) {
        dispatch(teamActions.createTeamSuccess(data.newTeam));
      } else {
        dispatch(notify(message, "error"));
        dispatch(teamActions.createTeamFailure());
      }
    } catch (error) {
      dispatch(teamActions.createTeamFailure());
    }
  };
};

// Hooks
export const useTeam = () => {
  const teams = useSelector(teamsSelector);
  const dispatch = useDispatch();

  return {
    teams,
    fetchTeams: (payload: Record<string, unknown> = {}) =>
      dispatch(fetchTeams(payload)),
    createTeam: (payload: Record<string, unknown> = {}) =>
      dispatch(createTeam(payload)),
    updateTeam: (teamId, payload: UpdateTeamT = {}) =>
      dispatch(updateTeam(teamId, payload)),
    deleteTeam: (teamId) => dispatch(deleteTeam(teamId)),
  };
};

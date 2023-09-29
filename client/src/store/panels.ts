/* eslint-disable  @typescript-eslint/no-explicit-any */

import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";
import { authSelector } from "./auth";
import { notebookSelector } from "./notebook";
import { notify } from "reapop";
import { ringSelector } from "./rings";
import appendQuery from "append-query";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import { makeRequest } from "../helpers/makeRequest";

const initialStateAnalysisItem: IPanelAnalysisItem = {
  id: "",
  statements: [],
  results: [],
};

const PanelInitialState = {
  loadingPanelResults: false,
  collapsed: true,
  resultsCollapsed: false,
  downloadingCsv: false,
  updatingPanel: false,
  hasErrors: false,
  analysis: [],
};
interface InitialState {
  loadingPanels: boolean;
  creatingPanel: boolean;
  deletingPanel: boolean;
  hasErrors: boolean;
  panels: Array<IPanel>;
}

export const initialState: InitialState = {
  loadingPanels: true,
  creatingPanel: false,
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
      loadingPanels: true,
    }),
    getPanelsSuccess: (state, { payload }) => {
      return {
        ...state,
        loadingPanels: false,
        hasErrors: false,
        panels: payload
          .map((panel) => ({
            ...PanelInitialState,
            ...state.panels.find((p) => p.id === panel.id),
            ...panel,
          }))
          .reverse(),
      };
    },
    getPanelsFailure: (state) => ({
      ...state,
      loadingPanels: false,
      hasErrors: true,
    }),
    createPanel: (state) => ({
      ...state,
      creatingPanel: true,
    }),
    createPanelSuccess: (state, { payload }) => ({
      ...state,
      panels: [...state.panels, { ...PanelInitialState, ...payload }],
      creatingPanel: false,
      hasErrors: false,
    }),
    createPanelFailure: (state) => ({
      ...state,
      creatingPanel: false,
      hasErrors: true,
    }),
    updatePanel: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, updatingPanel: true }
          : panel,
      ),
    }),
    updatePanelSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.id
          ? { ...panel, ...payload, updatingPanel: false }
          : panel,
      ),
      hasErrors: false,
    }),
    updatePanelFailure: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, updatingPanel: false, hasErrors: true }
          : panel,
      ),
    }),
    deletePanel: (state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        deletingPanel: true,
      })),
    }),
    deletePanelSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.filter((panel) => panel.id !== payload),
      deletingPanel: false,
      hasErrors: false,
    }),
    deletePanelFailure: (state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        deletingPanel: false,
        hasErrors: true,
      })),
      deletingPanel: false,
      hasErrors: true,
    }),
    getPanelResults: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, loadingPanelResults: true }
          : panel,
      ),
    }),
    getPanelResultsSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) => {
        return panel.id === payload.panelId
          ? {
              ...panel,
              results: payload.results,
              loadingPanelResults: false,
              hasErrors: false,
            }
          : panel;
      }),
    }),
    getPanelResultsFailure: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
              ...panel,
              loadingPanelResults: false,
              hasErrors: true,
            }
          : panel,
      ),
    }),
    setPanelFilters: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, filters: payload.filters }
          : panel,
      ),
    }),
    clearPanelFilters: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId ? { ...panel, filters: [] } : panel,
      ),
    }),
    clearPanel: (state, { payload }) => ({
      ...state,
      panels: state.panels.filter((panel) => panel.id !== payload),
    }),
    clearPanels: (state) => ({
      ...state,
      panels: [],
      loadingPanels: false,
    }),
    setPanelCollapsed: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, collapsed: payload.collapsed }
          : panel,
      ),
    }),
    setPanelResultsCollapsed: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, resultsCollapsed: payload.collapsed }
          : panel,
      ),
    }),
    setPanelDescription: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, description: payload.description }
          : panel,
      ),
    }),
    addPanelAnalysis: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
              ...panel,
              analysis: [
                ...panel.analysis,
                { ...initialStateAnalysisItem, ...payload.analysis },
              ],
            }
          : panel,
      ),
    }),
    removePanelAnalysis: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
              ...panel,
              analysis: panel.analysis.filter(
                (analysis) => analysis.id !== payload.analysisId,
              ),
            }
          : panel,
      ),
    }),
    addPanelAnalysisStatement: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
              ...panel,
              analysis: panel.analysis.map((analysis) =>
                analysis.id === payload.analysisId
                  ? {
                      ...analysis,
                      statements: [...analysis.statements, payload.statement],
                    }
                  : analysis,
              ),
            }
          : panel,
      ),
    }),
    removePanelAnalysisStatement: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
              ...panel,
              analysis: panel.analysis.map((analysis) =>
                analysis.id === payload.analysisId
                  ? {
                      ...analysis,
                      statements: analysis.statements.filter(
                        (statement) => statement.id !== payload.statementId,
                      ),
                    }
                  : analysis,
              ),
            }
          : panel,
      ),
    }),
    getCsv: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, downloadingCsv: true }
          : panel,
      ),
    }),
    getCsvSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, downloadingCsv: false }
          : panel,
      ),
    }),
    getCsvFailure: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, downloadingCsv: false, hasErrors: true }
          : panel,
      ),
    }),
  },
});

// Three actions generated from the slice
export const panelsActions = panelsSlice.actions;

// Selectors
export const panelsSelector = (state: RootState, notebookId) => ({
  ...state.panels,
  panels: state.panels.panels.filter(
    (panel) => panel.notebookId === notebookId,
  ),
});
export const panelSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels?.find((panel) => panel.id === panelId);
};
export const panelFiltersSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels?.find((panel) => panel.id === panelId)?.filters;
};
export const panelResultsSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels.find((panel) => panel.id === panelId)?.results;
};
export const panelAnalysisSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels.find((panel) => panel.id === panelId)?.analysis;
};

// The reducer
export default panelsSlice.reducer;

// Thunk Async Actions
export const getPanels = (notebookId) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(panelsActions.getPanels());

      const { data, message, code } = await makeRequest.get(
        `/api/notebooks/${notebookId}/panels`,
      );

      if (code === 200) {
        dispatch(panelsActions.getPanelsSuccess(data.panels));
      } else {
        dispatch(notify(message, "error"));
        dispatch(panelsActions.getPanelsFailure());
      }
    } catch (error) {
      dispatch(panelsActions.getPanelsFailure());
    }
  };
};

export const createPanel =
  (payload: any = {}) =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const { user } = authSelector(getState());
      const { notebook } = notebookSelector(getState());

      dispatch(panelsActions.createPanel());

      const { data, message, code } = await makeRequest.post(`/api/panels`, {
        ...payload,
        notebookId: notebook.id,
        userId: user.id,
      });

      if (code === 200) {
        dispatch(panelsActions.createPanelSuccess(data.panel));
      } else {
        dispatch(notify(message, "error"));
        dispatch(panelsActions.createPanelFailure());
      }
    } catch (error) {
      dispatch(panelsActions.createPanelFailure());
    }
  };

export const updatePanel =
  (panelId, payload: any = {}) =>
  async (dispatch: AppDispatch, getState) => {
    try {
      dispatch(panelsActions.updatePanel({ panelId }));

      const { data, message, code } = await makeRequest.put(
        `/api/panels/${panelId}`,
        payload,
      );

      if (code === 200) {
        // dispatch(notify(message, "success"));
        dispatch(panelsActions.updatePanelSuccess(data.panel));
      } else {
        dispatch(notify(message, "error"));
        dispatch(panelsActions.updatePanelFailure({ panelId }));
      }
    } catch (error) {
      dispatch(panelsActions.updatePanelFailure({ panelId }));
    }
  };

export const deletePanel =
  (panelId) => async (dispatch: AppDispatch, getState) => {
    try {
      dispatch(panelsActions.deletePanel());

      const { message, code } = await makeRequest.delete(
        `/api/panels/${panelId}`,
      );

      if (code === 200) {
        dispatch(notify(message, "success"));
        dispatch(panelsActions.deletePanelSuccess(panelId));
      } else {
        dispatch(notify(message, "error"));
        dispatch(panelsActions.deletePanelFailure());
      }
    } catch (error) {
      dispatch(panelsActions.deletePanelFailure());
    }
  };

export const getPanelResults =
  (panelId, filters = [], page = 0, batchSize = 10) =>
  async (dispatch: AppDispatch, getState) => {
    try {
      const panel = panelSelector(getState(), panelId);
      const { filters, ringId } = panel;
      // @ts-ignore
      const { rid, info, version } = ringSelector(getState(), ringId);
      dispatch(panelsActions.getPanelResults({ panelId }));

      const filterParams = filters
        ?.map((filter) => {
          if (!filter.value) return null;

          if (
            filter.type === "filing_date" ||
            filter.type === "terminating_date"
          ) {
            const start = dayjs(filter.value[0]).format("YYYY-M-DD");
            const end = dayjs(filter.value[1]).format("YYYY-M-DD");
            return `${filter.type}=${start},${end}`;
          }

          return `${filter.type}=${encodeURIComponent(filter.value)}`;
        })
        .join("&");

      const response = await makeRequest.get(
        appendQuery(
          `/proxy/results/${rid}/${version}/${info.defaultEntity}?page=${page}&batchSize=${batchSize}&sortBy=dateFiled&sortDirection=desc`,
          filterParams,
          { encodeComponents: false },
        ),
      );

      if (response) {
        dispatch(
          panelsActions.getPanelResultsSuccess({
            panelId,
            results: response,
          }),
        );
      } else {
        dispatch(notify("Error fetching results", "error"));
        dispatch(panelsActions.getPanelResultsFailure({ panelId }));
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(notify("Error fetching results", "error"));
      dispatch(panelsActions.getPanelResultsFailure({ panelId }));
    }
  };

export const downloadCsv = 
  (panelId) => 
  async (dispatch: AppDispatch, getState) => {
    try {
      const panel = panelSelector(getState(), panelId);
      const { filters, ringId } = panel;

      // @ts-ignore
      const { rid, info, version } = ringSelector(getState(), ringId);
      dispatch(panelsActions.getCsv({ panelId }));
      const filterParams = filters
      ?.map((filter) => {
        if (!filter.value) return null;

        if (
          filter.type === "filing_date" ||
          filter.type === "terminating_date"
        ) {
          const start = dayjs(filter.value[0]).format("YYYY-M-DD");
          const end = dayjs(filter.value[1]).format("YYYY-M-DD");
          return `${filter.type}=${start},${end}`;
        }

        return `${filter.type}=${encodeURIComponent(filter.value)}`;
      })
      .join("&");

      const response = await makeRequest.get(
        appendQuery(
          `/proxy/download-csv/${rid}/${version}/${info.defaultEntity}/`,
          filterParams,
          { encodeComponents: false },
        ),
        { responseType: "blob" }
      );

      if(response) {
        dispatch(panelsActions.getCsvSuccess({ panelId }));
      } else {
        dispatch(notify("Error fetching results", "error"));
        dispatch(panelsActions.getCsvFailure({ panelId }));
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
      dispatch(notify("Error fetching results", "error"));
      dispatch(panelsActions.getCsvFailure({ panelId }));
    }
  };

// Hooks
export const usePanels = (notebookId) => {
  const { panels, loadingPanels, hasErrors, creatingPanel, deletingPanel } =
    useSelector((state: RootState) => ({
      ...state.panels,
      ...panelsSelector(state, notebookId),
    }));
  const dispatch = useDispatch();

  return {
    panelsActions,
    panels,
    loadingPanels,
    hasErrors,
    creatingPanel,
    deletingPanel,
    updatePanel: (panelId, payload) => dispatch(updatePanel(panelId, payload)),
    getPanels: (notebookId) => dispatch(getPanels(notebookId)),
    createPanel: (payload: any = {}) => dispatch(createPanel(payload)),
    deletePanel: (panelId) => dispatch(deletePanel(panelId)),
  };
};

export const usePanel = (panelId: string) => {
  const panel = useSelector((state: RootState) =>
    panelSelector(state, panelId),
  );
  const results = useSelector((state: RootState) =>
    panelResultsSelector(state, panelId),
  );
  const filters = useSelector((state: RootState) =>
    panelFiltersSelector(state, panelId),
  );
  const analysis = useSelector((state: RootState) =>
    panelAnalysisSelector(state, panelId),
  );

  const {
    loadingPanelResults,
    resultsCollapsed,
    collapsed,
    downloadingCsv,
    updatingPanel,
    hasErrors,
  } = panel;
  const dispatch = useDispatch();

  return {
    panel,
    results,
    filters,
    loadingPanelResults,
    resultsCollapsed,
    collapsed,
    updatingPanel,
    hasErrors,
    analysis,
    downloadingCsv,
    addPanelAnalysis: (analysis) =>
      dispatch(panelsActions.addPanelAnalysis({ panelId, analysis })),
    removePanelAnalysis: (id) =>
      dispatch(panelsActions.removePanelAnalysis({ panelId, analysisId: id })),
    addPanelAnalysisStatement: (payload) =>
      dispatch(panelsActions.addPanelAnalysisStatement(payload)),
    removePanelAnalysisStatement: (payload) =>
      dispatch(panelsActions.removePanelAnalysisStatement(payload)),
    setPanelDescription: (description) =>
      dispatch(panelsActions.setPanelDescription({ panelId, description })),
    setPanelCollapsed: (collapsed: boolean) =>
      dispatch(panelsActions.setPanelCollapsed({ panelId, collapsed })),
    setPanelResultsCollapsed: (collapsed: boolean) =>
      dispatch(panelsActions.setPanelResultsCollapsed({ panelId, collapsed })),
    setPanelFilters: (filters: any = {}) => {
      dispatch(panelsActions.setPanelFilters({ panelId, filters }));
    },
    updatePanel: (payload: any = {}) => dispatch(updatePanel(panelId, payload)),
    deletePanel: () => dispatch(deletePanel(panelId)),
    getPanelResults: (filters = [], page = 0, batchSize = 10) =>
      dispatch(getPanelResults(panelId, filters, page, batchSize)),
    downloadCsv: () =>
      dispatch(downloadCsv(panelId)),
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */

type FilterInput = {
  id: string;
  value: any;
  type: string;
};

interface IPanelResults {
  [key: string]: any;
}

interface IPanelAnalysisItemStatement {
  id: string;
  statement: string;
  [key: string]: any;
}
interface IPanelAnalysisItem {
  id: string;
  statements: Array<IPanelAnalysisItemStatement>;
  results: Array<any>;
}

interface IPanel {
  [key: string]: any;
  ringId: number;
  selectedRing: number;
  filters: Array<FilterInput>;
  results: IPanelResults;
  analysis: Array<IPanelAnalysisItem>;
  loadingPanelResults: boolean;
  collapsed: boolean;
  downloadingCsv: boolean;
  resultsCollapsed: boolean;
  updatingPanel: boolean;
  hasErrors: boolean;
}

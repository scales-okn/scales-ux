import React from 'react';
import { usePanel } from '../../store/panels';

export const Statement = ({ panelId, analysisId }) => {
  const { panel, analysis, removePanelAnalysisStatement } = usePanel(panelId);
  return (
    <div>Statement</div>
  )
}

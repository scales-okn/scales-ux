import React from "react";
import Panel from "./Panel";
import { usePanels } from "../../store/panels";

type PanelsProps = {
  notebookId: string | null;
};

const Panels = ({ notebookId }: PanelsProps) => {
  const { panels = [] } = usePanels(notebookId);

  return (
    <>
      {panels?.length > 0 &&
        panels.map((panel) => (
          <div key={panel.id}>
            <Panel panelId={panel.id} />
          </div>
        ))}
    </>
  );
};

export default Panels;

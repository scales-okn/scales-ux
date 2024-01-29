import React from "react";
import Panel from "./Panel";
import { usePanels } from "../../store/panels";

type PanelsProps = {
  notebookId: string | null;
  sessionUserCanEdit: boolean;
};

const Panels = ({ notebookId, sessionUserCanEdit }: PanelsProps) => {
  const { panels = [] } = usePanels(notebookId);

  return (
    <>
      {panels?.length > 0 &&
        panels.map((panel, idx) => (
          <div key={panel.id}>
            <Panel
              panelId={panel.id}
              defaultCollapsed={idx !== 0}
              sessionUserCanEdit={sessionUserCanEdit}
            />
          </div>
        ))}
    </>
  );
};

export default Panels;

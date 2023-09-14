import React from "react";
import Panel from "./Panel";
import { usePanels } from "../../store/panels";

type PanelsProps = {
  notebookId: string | null;
};

const Panels = ({ notebookId }: PanelsProps) => {
  const {
    panels = [],
    // loadingPanels, getPanels
  } = usePanels(notebookId);

  // TODO: Do we need this call?
  // useEffect(() => {
  //   if (!notebookId || loadingPanels) return;
  //   getPanels(notebookId);
  // }, [notebookId]); // eslint-disable-line react-hooks/exhaustive-deps

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

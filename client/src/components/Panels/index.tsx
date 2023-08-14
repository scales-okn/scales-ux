import React, { FunctionComponent, useEffect } from "react";
import Loader from "../Loader";
import Panel from "./Panel";
import { usePanels } from "../../store/panels";

type PanelsProps = {
  notebookId: string | null;
};

const Panels: FunctionComponent<PanelsProps> = ({ notebookId }) => {
  const { panels = [], loadingPanels, getPanels } = usePanels(notebookId);

  useEffect(() => {
    if (!notebookId || loadingPanels) return;
    // getPanels(notebookId); // TODO: Do we need this call?
  }, [notebookId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Loader animation="border" isVisible={loadingPanels}>
      <>
        {panels?.length > 0 &&
          panels.map((panel, index) => (
            <Panel key={index} panelId={panel.id} />
          ))}
      </>
    </Loader>
  );
};

export default Panels;

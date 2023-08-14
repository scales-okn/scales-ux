import React, { FunctionComponent } from "react";
import Loader from "../Loader";
import Panel from "./Panel";
import { usePanels } from "../../store/panels";

type PanelsProps = {
  notebookId: string | null;
};

const Panels: FunctionComponent<PanelsProps> = ({ notebookId }) => {
  const { panels = [], loadingPanels } = usePanels(notebookId);

  // TODO: Do we need this call?
  // useEffect(() => {
  //   if (!notebookId || loadingPanels) return;
  //   // getPanels(notebookId);
  // }, [notebookId]); // eslint-disable-line react-hooks/exhaustive-deps

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

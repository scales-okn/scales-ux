import React, { FunctionComponent } from "react";
import { usePanels } from "@store/panels";
import "./AddPanel.scss";
import { useNotebook } from "@store/notebook";
import StandardButton from "@components/Buttons/StandardButton";

type AddPanelProps = {
  notebookId: string | null;
};

const AddPanel: FunctionComponent<AddPanelProps> = ({ notebookId }) => {
  const { notebook } = useNotebook();
  const { createPanel } = usePanels(notebookId);

  return (
    <StandardButton
      className="add-panel-btn w-100"
      style={{ marginBottom: "80px" }}
      size="lg"
      variant="link"
      disabled={!notebook}
      onClick={() => createPanel()}
    >
      Add Panel
    </StandardButton>
  );
};

export default AddPanel;

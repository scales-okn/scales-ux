import React, { FunctionComponent } from "react";
import { Button } from "react-bootstrap";
import { usePanels } from "../../store/panels";
import "./AddPanel.scss";
import { useNotebook } from "../../store/notebook";

type AddPanelProps = {
  notebookId: string | null;
};

const AddPanel: FunctionComponent<AddPanelProps> = ({notebookId}) => {
  const { notebook } = useNotebook();
  const { createPanel } = usePanels(notebookId);

  return (
    <Button
      className="add-panel-btn w-100"
      size="lg"
      variant="link"
      disabled={!notebook}
      onClick={() => createPanel()}
    >
      Add Panel
    </Button>
  );
};

export default AddPanel;

import React, { FunctionComponent } from "react";
import { Button } from "react-bootstrap";
import { usePanels } from "../../store/panels";
import "./AddPanel.scss";
import { useNotebook } from "../../store/notebook";

const AddPanel: FunctionComponent = () => {
  const { createPanel } = usePanels();
  const { notebook } = useNotebook();

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

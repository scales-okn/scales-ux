import React from "react";
import { usePanels } from "src/store/panels";
import "./AddPanel.scss";
import { useNotebook } from "src/store/notebook";
import { Button } from "@mui/material";

type AddPanelProps = {
  notebookId: string | null;
};

const AddPanel = ({ notebookId }: AddPanelProps) => {
  const { notebook } = useNotebook();
  const { createPanel } = usePanels(notebookId);

  return (
    <Button
      style={{ marginBottom: "80px", width: "100%" }}
      size="large"
      color="success"
      variant="outlined"
      disabled={!notebook}
      onClick={() => createPanel()}
      sx={{ border: "1px dashed grey" }}
    >
      Add Panel
    </Button>
  );
};

export default AddPanel;

import React from "react";

import { usePanels } from "src/store/panels";
import { useNotebook } from "src/store/notebook";

import { Button } from "@mui/material";

type AddPanelProps = {
  notebookId: string | null;
  sessionUserCanEdit: boolean;
};

const AddPanel = ({ notebookId, sessionUserCanEdit }: AddPanelProps) => {
  const { notebook } = useNotebook();
  const { createPanel } = usePanels(notebookId);

  return (
    <Button
      style={{ marginBottom: "80px", width: "100%" }}
      size="large"
      color="primary"
      variant="outlined"
      disabled={!notebook || !sessionUserCanEdit}
      onClick={() => createPanel()}
      sx={{ border: "1px dashed grey" }}
    >
      Add Panel
    </Button>
  );
};

export default AddPanel;

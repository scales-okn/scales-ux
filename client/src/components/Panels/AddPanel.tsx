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
      sx={{
        marginBottom: "80px",
        marginTop: "24px",
        width: "100%",
        border: "1px dashed grey",
      }}
      size="large"
      color="primary"
      variant="outlined"
      disabled={!notebook || !sessionUserCanEdit}
      onClick={() => createPanel()}
    >
      Add Panel
    </Button>
  );
};

export default AddPanel;

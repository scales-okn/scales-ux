import React from "react";

import { usePanels } from "src/store/panels";
import { useNotebook } from "src/store/notebook";

import { Button, Box } from "@mui/material";

type AddPanelProps = {
  notebookId: string | null;
  sessionUserCanEdit: boolean;
};

const AddPanel = ({ notebookId, sessionUserCanEdit }: AddPanelProps) => {
  const { notebook } = useNotebook();
  const { createPanel } = usePanels(notebookId);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginBottom: "80px",
      }}
    >
      <Button
        sx={{
          margin: "24px 0 80px 0",
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
    </Box>
  );
};

export default AddPanel;

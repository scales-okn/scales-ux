import React from "react";

import { usePanels } from "src/store/panels";
import { useNotebook } from "src/store/notebook";
import { useSessionUser } from "src/store/auth";

import { Button } from "@mui/material";

type AddPanelProps = {
  notebookId: string | null;
};

const AddPanel = ({ notebookId }: AddPanelProps) => {
  const { notebook } = useNotebook();
  const { createPanel } = usePanels(notebookId);
  const sessionUser = useSessionUser();
  const sessionUserCanEdit = sessionUser?.id === notebook?.userId;

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

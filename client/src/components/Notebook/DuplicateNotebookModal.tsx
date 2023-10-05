import React, { useState } from "react";
import { useSelector } from "react-redux";

import { useNotebook } from "src/store/notebook";
// import { usePanels } from "src/store/panels";
import { sessionUserSelector } from "src/store/auth";

import { TextField, Button, Box, Typography } from "@mui/material";
import ModalContainer from "src/components/Modals/ModalContainer";

type DuplicateNotebookModalT = {
  setOpen: (open: boolean) => void;
};

const DuplicateNotebookModal = ({ setOpen }: DuplicateNotebookModalT) => {
  const sessionUser = useSelector(sessionUserSelector);

  const { notebook, createNotebook } = useNotebook();
  const [titleValue, setTitleValue] = useState(notebook?.title);

  const handleCopyNotebook = () => {
    createNotebook({
      ...notebook,
      userId: sessionUser.id,
      title: titleValue,
    });
    setOpen(false);
    // we also need to copy all panels, filters, and analyses
  };

  return (
    <ModalContainer open onClose={() => setOpen(false)}>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="h4" sx={{ marginBottom: "12px" }}>
          Duplicate Notebook
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontStyle: "italic", color: "GrayText", marginBottom: "24px" }}
        >
          This will create a copy of this notebook that you can edit. The copy
          will be saved in your notebook list. The original notebook will remain
          unchanged. You can delete the copy at any time.
        </Typography>
        <Typography variant="h6" sx={{ marginBottom: "8px" }}>
          New Notebook Title
        </Typography>
        <TextField
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          sx={{ marginBottom: "36px", width: "420px" }}
        />
        <Button
          onClick={handleCopyNotebook}
          variant="contained"
          color="success"
        >
          Copy Notebook
        </Button>
      </Box>
    </ModalContainer>
  );
};

export default DuplicateNotebookModal;

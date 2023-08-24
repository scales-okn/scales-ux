import React, { FunctionComponent } from "react";
import { Modal, Paper } from "@mui/material";

type ModalContainerT = {
  children: React.ReactNode;
  onClose: (arg: null) => void;
  open: boolean;
};

const ModalContainer: FunctionComponent<ModalContainerT> = ({
  children,
  onClose,
  open,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        maxHeight: "50hv",
        overflowY: "auto",
        "& .MuiPaper-root": {
          margin: "15% auto",
          width: "50vw",
          maxWidth: "1000px",
          minWidth: "400px",
        },
      }}
    >
      <Paper sx={{ padding: "24px", maxWidth: 400 }}>{children}</Paper>
    </Modal>
  );
};

export default ModalContainer;

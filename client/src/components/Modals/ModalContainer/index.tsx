import React, { FunctionComponent } from "react";
import { Modal, Paper } from "@mui/material";

type ModalContainerT = {
  children: React.ReactNode;
  onClose: (arg: null) => void;
  open: boolean;
  modalStyles?: Record<string, unknown>;
  paperStyles?: Record<string, unknown>;
};

const ModalContainer: FunctionComponent<ModalContainerT> = ({
  children,
  onClose,
  open,
  modalStyles = {},
  paperStyles = {},
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
          padding: "24px",
          ...paperStyles,
        },
        ...modalStyles,
      }}
    >
      <Paper sx={{ outline: "none" }}>{children}</Paper>
    </Modal>
  );
};

export default ModalContainer;

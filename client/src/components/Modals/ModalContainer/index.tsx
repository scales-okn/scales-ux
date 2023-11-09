import React from "react";
import { Modal, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

type ModalContainerT = {
  children: React.ReactNode;
  onClose: (arg: null) => void;
  open: boolean;
  modalStyles?: Record<string, unknown>;
  paperStyles?: Record<string, unknown>;
  title?: string;
};

const ModalContainer = ({
  children,
  onClose,
  open,
  modalStyles = {},
  paperStyles = {},
  title,
}: ModalContainerT) => {
  const theme = useTheme();

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
      <Paper sx={{ outline: "none" }}>
        {title && (
          <Typography
            sx={{
              fontSize: "32px",
              textAlign: "center",
              marginBottom: "48px",
              color: theme.palette.primary.main,
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Paper>
    </Modal>
  );
};

export default ModalContainer;

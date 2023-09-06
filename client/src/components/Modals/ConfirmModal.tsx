import React from "react";
import {
  Modal,
  ModalProps,
  Box,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import StandardButton from "@components/Buttons/StandardButton";

type ConfirmModalT = Omit<ModalProps, "children"> & {
  open: boolean;
  setOpen: (arg: boolean) => void;
  onConfirm: () => void;
  itemName: string;
};

const ConfirmModal = ({
  open,
  setOpen,
  onConfirm,
  itemName,
  ...modalProps
}: ConfirmModalT) => {
  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      {...modalProps}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{ width: 400, bgcolor: "background.paper", boxShadow: 24, p: 2 }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {itemName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <StandardButton variant="danger" onClick={handleClose}>
            Cancel
          </StandardButton>
          <StandardButton
            variant="primary"
            onClick={onConfirm}
            style={{ color: "white" }}
          >
            Delete
          </StandardButton>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;

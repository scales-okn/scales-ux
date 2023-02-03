import React, { FC } from "react";
import { Modal, Button } from "react-bootstrap";

type ConfirmModalProps = {
  open: boolean;
  setOpen: (arg: boolean) => void;
  onConfirm: () => void;
};

const ConfirmModal: FC<ConfirmModalProps> = ({ open, setOpen, onConfirm }) => {
  const handleClose = () => setOpen(false);

  return (
    <Modal show={open} onHide={handleClose} animation>
      <Modal.Body>Are you sure you want to delete this ring?</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          className="text-white me-2 btn"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button className="text-white me-2 btn btn-danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
